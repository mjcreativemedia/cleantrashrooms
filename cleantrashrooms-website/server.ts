import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

app.post(
  '/api/upload',
  upload.fields([
    { name: 'beforePhoto', maxCount: 1 },
    { name: 'afterPhoto', maxCount: 1 }
  ]),
  (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const before = files?.beforePhoto?.[0];
    const after = files?.afterPhoto?.[0];
    res.json({
      beforePhoto: before ? `/uploads/${before.originalname}` : '',
      afterPhoto: after ? `/uploads/${after.originalname}` : ''
    });
  }
);

app.use('/uploads', express.static(uploadsDir));

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`File server running on port ${port}`);
});
