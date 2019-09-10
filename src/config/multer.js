import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    // Caminho da pasta de uploads
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        // 1º parametro de uma callback é sempre o erro
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
