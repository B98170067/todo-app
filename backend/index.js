import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import uploadRoutes from './routes/todoUpload.js';
import { setupSwagger } from './swagger.js';
 
import dotenvFlow from 'dotenv-flow';
dotenvFlow.config(); // 自動根據 NODE_ENV 載入對應 .env 檔

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
