import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express"; 

const prisma = new PrismaClient();

export const getUpload = (req: Request, res: Response) => {
    return res.status(200).json({test:'test'});
};

export const fileUpload = async (req: Request, res: Response) => {
  try {
    const uploadedFile = req.file;
    const data = JSON.parse(req.body.data); 
    if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
    } 
    try {
      const created = await prisma.compressions.create({
          data: {
            data: data[0]
          }
      });
      return res.status(200).json({ message: 'File uploaded successfully', data: created.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
  }
  } catch (error) { 
      console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};