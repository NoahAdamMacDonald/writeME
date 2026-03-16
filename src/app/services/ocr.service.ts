import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  async extractText(file: File): Promise<string> {
    const worker = await createWorker('eng');

    const { data } = await worker.recognize(file);
    await worker.terminate();

    return data.text;
  }

  constructor() { }
}
