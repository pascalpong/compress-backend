import * as express from 'express';
import { fileUpload, getUpload } from '../controllers/uploadController';
import upload from '../config/multerConfig';

const router = express.Router();

router.get('/', getUpload);
router.post('/', upload.single('file'), fileUpload);

export default router;