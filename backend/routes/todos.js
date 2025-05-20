import express from 'express';
import Todo from '../models/todo.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// 所有 API 都加上驗證
router.use(authenticate);

// 取得該使用者的 todo
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.id });
        res.json(todos);
    } catch {
        res.status(500).json({ message: 'Failed to fetch todos' });
    }
});

// 新增 todo，userId 從登入者身分給定
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

// 修改 todo（只能修改自己的）
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

// 刪除 todo（只能刪除自己的）
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
