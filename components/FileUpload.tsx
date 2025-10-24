import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  waitForReview: boolean;
  setWaitForReview: (value: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, waitForReview, setWaitForReview }) => {
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

      <div className="mt-8 flex items-center justify-center">
        <label htmlFor="review-toggle" className="flex items-center cursor-pointer select-none">
          <div className="relative">
            <input 
              type="checkbox" 
              id="review-toggle" 
              className="sr-only peer" 
              checked={waitForReview}
              onChange={(e) => setWaitForReview(e.target.checked)}
            />
            <div className="block bg-gray-300 w-14 h-8 rounded-full peer-checked:bg-[#009c6d] transition-colors"></div>
            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
          </div>
          <div className="ml-4 text-gray-700 font-medium">
            Wait for my review before system input
          </div>
        </label>
      </div>

    </div>
  );
};