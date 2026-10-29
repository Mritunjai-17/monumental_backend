import multer from 'multer';
import path from 'path';
import fs from 'fs';

const isVercel = Boolean(process.env.VERCEL);

// In Vercel serverless environments, the filesystem is read-only except /tmp
const UPLOAD_DIR = isVercel
  ? path.join('/tmp', 'uploads', 'news')
  : path.resolve(process.cwd(), 'public/uploads/news');

// Safe directory creation inside try/catch (never crash top-level on serverless boot)
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  // Gracefully ignored on read-only environments
}

// In Vercel serverless functions, use memoryStorage so PDF parsing works directly in-memory
const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        try {
          if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
          }
        } catch (e) {
          // ignore
        }
        cb(null, UPLOAD_DIR);
      },
      filename: function (req, file, cb) {
        const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
        cb(null, `${uniqueSuffix}-${cleanOriginalName}`);
      }
    });

function fileFilter(req, file, cb) {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed for press release uploads'), false);
  }
}

export const uploadPdf = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB max
});
