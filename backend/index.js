import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';

// 使用 dotenv 套件來讀取 .env 檔案中的環境變數
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

connectDB();

// 允許前端從不同網域請求資料
app.use(cors());
// 讓伺服器能夠解析 JSON 格式的請求資料
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

// 啟動伺服器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
