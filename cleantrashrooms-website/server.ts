import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({ storage });

app.post(
  '/api/upload',
  upload.fields([
    { name: 'beforePhoto', maxCount: 1 },
    { name: 'afterPhoto', maxCount: 1 }
  ]),
  (req, res) => {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const result: Record<string, string> = {};

    if (files?.beforePhoto?.[0]) {
      const f = files.beforePhoto[0];
      console.log(`Saved file: ${f.originalname} as ${f.filename}`);
      result.beforePhoto = `/uploads/${f.filename}`;
    }

    if (files?.afterPhoto?.[0]) {
      const f = files.afterPhoto[0];
      console.log(`Saved file: ${f.originalname} as ${f.filename}`);
      result.afterPhoto = `/uploads/${f.filename}`;
    }

    res.json(result);
  }
);

app.use('/uploads', express.static(uploadsDir));

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`File server running on port ${port}`);
});
