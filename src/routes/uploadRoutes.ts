import * as express from 'express';
import { fileCompress, fileUpload } from '../controllers/uploadController';
import upload from '../config/multerConfig';

const router = express.Router();

router.post('/', upload.single('file'), fileUpload);
router.patch('/compress', fileCompress);

export default router;