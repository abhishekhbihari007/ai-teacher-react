// PDF processing utilities
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

export const extractTextFromPDF = async (file) => {
  const reader = new FileReader();
  const typedarray = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
  
  const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
};

export const extractTextFromDOCX = async (file) => {
  // For a real application, you'd send this to a backend API.
  // We will simulate text extraction here for the demonstration.
  return '(Simulated text from DOCX: The document covers topics on machine learning models, neural networks, and supervised vs. unsupervised learning. It also includes sections on data preprocessing and model evaluation metrics.)\n\n';
};

export const processFiles = async (files) => {
  let fullText = '';
  let isDocx = false;

  for (const file of files) {
    if (file.type === 'application/pdf') {
      const text = await extractTextFromPDF(file);
      fullText += text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      isDocx = true;
      const text = await extractTextFromDOCX(file);
      fullText += text;
    }
  }

  return { fullText: fullText.trim(), isDocx };
};
