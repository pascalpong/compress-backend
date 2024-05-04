import { Request, Response } from "express";

export const getUpload = (req: Request, res: Response) => {
    return res.status(200).json({test:'test'});
};

export const fileUpload = (req: Request | any, res: Response) => {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    // Do something with the uploaded file
    console.log('Uploaded file:', uploadedFile);
  
    // Send a response
    res.status(200).json({ message: 'File uploaded successfully' });

};