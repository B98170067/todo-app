import express from 'express';
import Todo from '../models/todo.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// 所有 API 都加上驗證
router.use(authenticate);
 
/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Todo CRUD
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
 
/**
 * @swagger
 * /todos:
 *   get:
 *     summary: 取得該登入者的 todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功回傳 Todo 清單
 */
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.id });
        res.json(todos);
    } catch {
        res.status(500).json({ message: 'Failed to fetch todos' });
    }
});

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: 新增 todo，userId 從登入者身分給定
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: 建立成功
 */
router.post('/', async (req, res) => {
    try { 
        const newTodo  = new Todo({
            title: req.body.title,
            completed: req.body.completed ?? false,
            userId: req.user.id
        });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to create todos' });
    }
});
 
/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: 修改指定 Todo（只能修改自己的）
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 修改成功
 *       404:
 *         description: 找不到
 */
router.put('/:id', async (req, res) => {
    try { 
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found or not yours' });
        }

        res.json(updatedTodo);
    } catch {
        res.status(400).json({ message: 'Invalid ID' });
    }
});
 
/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: 刪除指定 Todo（只能刪除自己的）
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 刪除成功
 *       404:
 *         description: 找不到
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id 
        });

        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found or not yours' });
        }

        res.status(204).send();
    } catch {
        res.status(400).json({ message: 'Invalid ID' });
    }
});

export default router;
