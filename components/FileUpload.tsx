import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      // FIX: Corrected typo from `dataTansfer` to `dataTransfer`.
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileUpload(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
    [onFileUpload]
  );
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onFileUpload(e.target.files[0]);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full max-w-2xl p-12 border-2 border-dashed rounded-xl transition-colors duration-300 ${
          isDragging ? 'border-[#009c6d] bg-[#009c6d]/10' : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
        />
        <UploadIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">
          Drop your invoice here
        </h3>
        <p className="text-gray-600 mt-1">or click to browse</p>
        <p className="text-xs text-gray-500 mt-4">Supports PDF, PNG, JPG</p>
      </div>
    </div>
  );
};
