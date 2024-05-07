import * as express from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as cors from 'cors';
import * as fs from 'fs';
import * as multer from 'multer';

dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import uploadRouter from './routes/uploadRoutes';
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/upload', uploadRouter);

app.get('/download/compressed/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'public', 'compressed', fileName);

  console.log(filePath);
  
try {
  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
} catch (error) {
  console.log(error)
} 
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});