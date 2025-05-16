import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const port = 3000;

// 設定資料庫路徑
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { todos: [] });
 
// 允許前端從不同網域請求資料
app.use(cors());
// 讓伺服器能夠解析 JSON 格式的請求資料
app.use(bodyParser.json());

// 取得所有代辦事項
app.get('/todos', async (req, res) => {
    await db.read();
    res.json(db.data.todos);
});

// 新增代辦事項
app.post('/todos', async (req, res) => {
    const { title } = req.body;
    const newTodo = { id: Date.now().toString(), title, completed: false };
    db.data.todos.push(newTodo);
    await db.write();
    res.status(201).json(newTodo);
});

// 更新代辦事項
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;

    const todo = db.data.todos.find(t => t.id === id);
    if (todo) {
        todo.title = title ?? todo.title;
        todo.completed = completed ?? todo.completed;
        await db.write();
        res.json(todo);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
});

// 刪除代辦事項
app.delete('/todos/:id', async (req, res) => {
    db.data.todos = db.data.todos.filter(t => t.id !== req.params.id);
    await db.write();
    res.status(204).send();
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
