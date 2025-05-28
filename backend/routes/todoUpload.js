import express from 'express';
import multer from 'multer';
import uploadToGCS, { deleteFromGCS, getSignedDownloadUrl } from '../services/gcsUploader.js';
import Todo from '../models/todo.js';
import authenticate from '../middleware/authenticate.js';
import contentDisposition from 'content-disposition';

const router = express.Router();

router.use(authenticate);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 限制檔案大小為 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('只允許上傳 PNG, JPEG, PDF 檔案'));
        }
    }
});

/**
 * @swagger
 * /upload/attachments/{id}:
 *   get:
 *     summary: 取得該登入者指定 Todo 的附件清單
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功回傳 Todo 的附件清單
 */
router.get('/attachments/:id', async (req, res) => {
    try {
        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found or not yours' });
        }

        res.json(todo.attachments);
    } catch {
        res.status(400).json({ message: 'Invalid ID' });
    }
});

/**
 * @swagger
 * /upload/attachments/{todoId}/{filename}:
 *   get:
 *     summary: 使用簽章連結下載附件（有效期限 15 分鐘）
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 檔案名稱
 *     responses:
 *       302:
 *         description: 成功轉向到簽章連結
 *       404:
 *         description: 找不到 Todo 或 附件
 *       500:
 *         description: 發生錯誤
 */
router.get('/attachments/:todoId/:filename', async (req, res) => {
    try {
        const { todoId, filename } = req.params;
        const todo = await Todo.findById(todoId);

        if (!todo) {
            return res.status(404).json({ error: '找不到 Todo' });
        }

        const fullUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`;
        const exists = todo.attachments.includes(fullUrl);
        if (!exists) {
            return res.status(404).json({ error: '找不到該附件' });
        }

        const signedUrl = await getSignedDownloadUrl(filename);
        // res.redirect(signedUrl);
        res.status(200).json({
            fileUrl: signedUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '下載失敗' });
    }
});

/**
 * @swagger
 * /upload/{todoId}/attachments/download-direct/{filename}:
 *   get:
 *     summary: 直接下載附件
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 檔案名稱（含副檔名）
 *     responses:
 *       200:
 *         description: 下載成功
 *       404:
 *         description: 找不到 Todo 或 附件
 *       500:
 *         description: 發生錯誤
 */
router.get('/:todoId/attachments/download-direct/:filename', async (req, res) => {
    try {
        const { todoId, filename } = req.params;

        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ error: '找不到 Todo' });
        }

        const fullUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`;
        const exists = todo.attachments.includes(fullUrl);
        if (!exists) {
            return res.status(404).json({ error: '找不到該附件' });
        }

        const bucket = getBucket();
        const file = bucket.file(filename);
        // 取得檔案 metadata（可取得 contentType）
        const [metadata] = await file.getMetadata();

        res.setHeader('Content-Type', metadata.contentType);
        res.setHeader('Content-Disposition', contentDisposition(filename));

        file.createReadStream()
            .on('error', (err) => {
                console.error('讀取失敗:', err);
                res.status(500).json({ error: '下載失敗' });
            })
            .pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '下載失敗' });
    }
});

/**
 * @swagger
 * /upload/{todoId}/upload-single:
 *   post:
 *     summary: 上傳單一附件
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: 單一檔案（PNG, JPEG, PDF）
 *     responses:
 *       200:
 *         description: 上傳成功
 *       400:
 *         description: 未提供檔案
 *       404:
 *         description: 找不到 Todo
 *       500:
 *         description: 上傳失敗
 */
router.post('/:todoId/upload-single', upload.single('file'), async (req, res) => {
    try {
        const { todoId } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: '未提供檔案' });
        }

        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ error: '找不到 Todo' });
        }

        const fileUrl = await uploadToGCS(file.buffer, file.originalname, file.mimetype);
        todo.attachments.push(fileUrl);
        await todo.save();

        res.status(200).json({
            message: '上傳成功',
            fileUrl,
            todo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '上傳失敗' });
    }
});

/**
 * @swagger
 * /upload/{todoId}/upload-multiple:
 *   post:
 *     summary: 上傳多個附件
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *       - in: formData
 *         name: files
 *         type: array
 *         items:
 *           type: file
 *         required: true
 *         description: 多個檔案（最多 5 個）
 *     responses:
 *       200:
 *         description: 上傳成功
 *       400:
 *         description: 未提供檔案
 *       404:
 *         description: 找不到 Todo
 *       500:
 *         description: 上傳失敗
 */
router.post('/:todoId/upload-multiple', upload.array('files', 5), async (req, res) => {
    try {
        const { todoId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: '未提供檔案' });
        }

        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ error: '找不到 Todo' });
        }

        const uploadResults = await Promise.all(
            files.map(file => uploadToGCS(file.buffer, file.originalname, file.mimetype))
        );

        todo.attachments.push(...uploadResults);
        await todo.save();

        res.status(200).json({
            message: '上傳成功',
            files: uploadResults,
            todo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '上傳失敗' });
    }
});

/**
 * @swagger
 * /upload/attachments/{todoId}/{filename}:
 *   delete:
 *     summary: 刪除單一附件
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 檔案名稱
 *     responses:
 *       200:
 *         description: 刪除成功
 *       404:
 *         description: 找不到 Todo 或 附件
 *       500:
 *         description: 刪除失敗
 */
router.delete('/attachments/:todoId/:filename', async (req, res) => {
    try {
        const { todoId, filename } = req.params;
        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ error: '找不到 Todo' });
        }

        const fullUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`;
        const index = todo.attachments.indexOf(fullUrl);
        if (index === -1) {
            return res.status(404).json({ error: '找不到附件' });
        }

        // 從 GCS 刪除
        await deleteFromGCS(filename);

        // 從 todo 移除
        todo.attachments.splice(index, 1);
        await todo.save();

        res.status(200).json({ message: '刪除成功', todo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '刪除失敗' });
    }
});

/**
 * @swagger
 * /upload/attachments/{todoId}:
 *   delete:
 *     summary: 刪除所有附件
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: 刪除成功
 *       404:
 *         description: 找不到 Todo
 *       500:
 *         description: 刪除失敗
 */
router.delete('/attachments/:todoId', async (req, res) => {
    try {
        const { todoId } = req.params;
        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ error: '找不到 Todo' });
        }

        // 從 GCS 刪除
        const deleteJobs = todo.attachments.map(fullUrl => {
            const filename = fullUrl.split('/').pop();
            return deleteFromGCS(filename);
        });
        await Promise.allSettled(deleteJobs);

        // 從 todo 移除
        todo.attachments = [];
        await todo.save();

        res.status(200).json({ message: '刪除成功', todo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '刪除失敗' });
    }
});

export default router; 
