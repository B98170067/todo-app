import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: [{ type: String }] // 儲存 GCS 檔案 URL 陣列
}, { timestamps: true });

export default mongoose.model('Todo', todoSchema);
