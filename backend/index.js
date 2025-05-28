import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import uploadRoutes from './routes/todoUpload.js';
import { setupSwagger } from './swagger.js';
 
// 使用 dotenv 套件根據 NODE_ENV 載入對應的 .env 檔
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
// ESM 環境中模擬 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

const app = express();
const port = process.env.PORT || 3000;

connectDB();

// 允許前端從不同網域請求資料
app.use(cors());
// 讓伺服器能夠解析 JSON 格式的請求資料
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
app.use('/upload', uploadRoutes);
 
// Swagger 文件
setupSwagger(app);

// 啟動伺服器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});
