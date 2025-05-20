import express from 'express';
import Todo from '../models/todo.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch {
        res.status(500).json({ message: 'Failed to fetch todos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        const newTodo = new Todo({ title });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch {
        res.status(500).json({ message: 'Failed to create todos' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { $set: { title, completed } },
            { new: true }
        );
        if (updatedTodo) {
            res.json(updatedTodo);
        } else {
            res.status(404).json({ message: 'Todo not found' });
        }
    } catch {
        res.status(400).json({ message: 'Invalid ID' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch {
        res.status(400).json({ message: 'Invalid ID' });
    }
});

export default router;
