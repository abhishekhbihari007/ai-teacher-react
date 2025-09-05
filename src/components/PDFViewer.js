import React, { useState, useEffect } from 'react';

const PDFViewer = ({ files }) => {
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (files && files.length > 0) {
      const firstFile = files[0];
      if (firstFile.type === 'application/pdf') {
        const url = URL.createObjectURL(firstFile);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPdfUrl('');
      }
    } else {
      setPdfUrl('');
    }
  }, [files]);

  if (!files || files.length === 0) {
    return (
      <div className="pdf-viewer mb-8">
        <p className="text-center text-gray-500 mt-4">
          Your uploaded PDFs will appear here (first file shown).
        </p>
      </div>
    );
  }

  return (
    <div className="pdf-viewer mb-8">
      {pdfUrl ? (
        <iframe 
          src={pdfUrl} 
          className="pdf-viewer" 
          frameBorder="0"
          title="PDF Viewer"
        />
      ) : (
        <p className="text-center text-gray-500 mt-4">
          Non-PDF files uploaded. PDF viewer not available.
        </p>
      )}
    </div>
  );
};

export default PDFViewer;
