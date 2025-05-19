import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const port = 3000;

// 允許前端從不同網域請求資料
app.use(cors());
// 讓伺服器能夠解析 JSON 格式的請求資料
app.use(bodyParser.json());

// 連線到 MongoDB
mongoose.connect('mongodb://admin:7ujm*IK<@localhost:27017/todosdb?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// 定義 Todo 模型
const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

// 取得所有代辦事項
app.get('/todos', async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

// 新增代辦事項
app.post('/todos', async (req, res) => {
    const { title } = req.body;
    const newTodo = new Todo({ title });
    await newTodo.save();
    res.status(201).json(newTodo);
});

// 更新代辦事項
app.put('/todos/:id', async (req, res) => {
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
    } catch (err) {
        res.status(400).json({ message: 'Invalid ID' });
    }
});

// 刪除代辦事項
app.delete('/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ message: 'Invalid ID' });
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
