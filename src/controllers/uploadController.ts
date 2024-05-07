import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express"; 
import { promisify } from 'util';
import * as fs from 'fs'; 
import { PDFDocument, PDFName } from 'pdf-lib';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const prisma = new PrismaClient();

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
            data: { ...data[0], originalname: uploadedFile.originalname, fileName: uploadedFile.filename }
          }
      });
      return res.status(200).json({ message: 'File uploaded successfully', data: created.data, jobId: created.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
  }
  } catch (error) { 
      console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const fileCompress = async (req: Request, res: Response) => {
  try {
    const { jobId, colorMode, dpi, quality } = req.body;

    const compressionJob = await prisma.compressions.findUnique({
      where: { id: jobId },
    }); 
    if (!compressionJob) {
      return res.status(404).json({ error: 'Compression job not found' });
    }
 
    const data = compressionJob.data as any; 
    const file = data.fileName;

    // Read the file from the uploads folder
    const filePath = `src/public/uploads/${file}`;
    const fileData = await readFileAsync(filePath);
 
    const compressedPdf = await compressPdf(fileData, dpi, quality);

    // Save the compressed file
    const compressedFileName = `compressed_${Date.now()}.pdf`;
    const compressedFilePath = `src/public/compressed/${compressedFileName}`;
    await writeFileAsync(compressedFilePath, compressedPdf);

    // Update the compression details in the database
    const result = await prisma.compressions.update({
      where: { id: jobId },
      data: {
        compressSetting: JSON.stringify({ colorMode, dpi, quality }),
        compressedFile: {
          file: compressedFileName,
          size: compressedPdf.length,
          location: compressedFilePath,
        },
      },
    }); 
    
    const downloadUrl = `${result.data['host']}/download/compressed/${compressedFileName}`
    const jobState = {
      jobId: compressionJob.id,
      status: "completed",
      job: {
        state: "completed",
        'processing.heartbeat': new Date(),
        'out.file': compressedFileName,
        'out.name': result.data['originalname'],
        'out.size': compressedPdf.length,
        'param.colorModel': colorMode
      },
      downloadUrl
    };
    return res.status(200).json({ message: 'File compressed successfully', data: jobState });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


async function compressPdf(pdfData: Uint8Array, dpi: number, quality: number): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfData);
  const pages = pdfDoc.getPages();

  // for (const page of pages) {
    // const images = await getImagesFromPage(page);

  //   for (const image of images) {
  //     image.scale(dpi / 72); // Adjust image DPI
  //   }
  // }

  // Compress the entire PDF with the specified quality
  const pdfBytes = await pdfDoc.save({ compress: quality } as any);

  return pdfBytes;
}

async function getImagesFromPage(page: any): Promise<any[]> {
  const images: any[] = [];

  const operatorList = await page.getOperatorList();

  for (let i = 0; i < operatorList.length; i++) {
    const operator = operatorList[i];
    if (operator.fn === 'Do' && operator.args && operator.args[0] && operator.args[0].name === 'Im') {
      images.push(operator);
    }
  }

  return images;
}

