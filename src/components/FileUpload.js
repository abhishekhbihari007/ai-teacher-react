import React from 'react';

const FileUpload = ({ onFileUpload, onExtractText, isExtracting }) => {
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileNames, setFileNames] = React.useState('No file chosen');

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 0) {
      setUploadedFiles(files);
      const names = files.map(f => f.name).join(', ');
      setFileNames(names);
      onFileUpload(files);
    } else {
      setUploadedFiles([]);
      setFileNames('No file chosen');
      onFileUpload([]);
    }
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <label 
        htmlFor="pdf-upload" 
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition duration-300 ease-in-out shadow-md"
      >
        Upload PDF(s) & DOC(s)
      </label>
      <input 
        type="file" 
        id="pdf-upload" 
        accept=".pdf, .docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        multiple 
        className="hidden" 
        onChange={handleFileChange}
      />
      <span className="mt-4 text-gray-700 italic">{fileNames}</span>
      
      {uploadedFiles.length > 0 && (
        <button 
          onClick={onExtractText}
          disabled={isExtracting}
          className={`mt-6 font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md ${
            isExtracting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isExtracting ? 'Extracting...' : 'Extract Text'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
