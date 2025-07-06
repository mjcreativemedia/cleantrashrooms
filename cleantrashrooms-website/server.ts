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

app.post('/api/upload', upload.single('file'), (req, res) => {
  const filePath = `/uploads/${req.file?.originalname}`;
  res.json({ path: filePath });
});

app.use('/uploads', express.static(uploadsDir));

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`File server running on port ${port}`);
});
