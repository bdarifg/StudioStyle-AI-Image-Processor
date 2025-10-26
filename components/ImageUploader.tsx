
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const acceptedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    }
  }, [onFilesSelected]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const acceptedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
       if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
       }
       e.target.value = ''; // Reset file input
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative w-full p-8 border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 bg-white'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center justify-center text-center cursor-pointer">
        <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg font-semibold text-gray-700">
          Drag & Drop your photos here
        </p>
        <p className="text-gray-500 mt-1">or <span className="text-primary-600 font-medium">click to browse</span></p>
        <p className="text-xs text-gray-400 mt-4">Supports multiple PNG, JPG, WEBP files</p>
      </div>
    </div>
  );
};

export default ImageUploader;
