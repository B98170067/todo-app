import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

function getBucket() {
    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName) {
        throw new Error('GCS_BUCKET not set in environment!');
    }
    const storage = new Storage();
    return storage.bucket(bucketName);
}

async function uploadToGCS(fileBuffer, originalName, mimetype) {
    const bucket = getBucket();
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${originalName}`;
    const file = bucket.file(filename);

    await file.save(fileBuffer, {
        metadata: {
            contentType: mimetype
        }
    });

    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

async function deleteFromGCS(filename) {
    const bucket = getBucket();
    const file = bucket.file(filename);
    await file.delete();
}
 
/**
 * 產生簽章下載連結
 * @param {string} filename - GCS 中的檔案名稱
 * @returns {Promise<string>} - 簽章連結
 */
async function getSignedDownloadUrl(filename) {
    const bucket = getBucket();
    const file = bucket.file(filename);
    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000 // 15 分鐘有效
    });
    return url;
}

export { uploadToGCS as default, deleteFromGCS, getSignedDownloadUrl };
