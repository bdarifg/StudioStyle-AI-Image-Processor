
import React from 'react';
import type { ProcessedImage } from '../types';
import { SpinnerIcon, DownloadIcon, CheckCircleIcon, ExclamationCircleIcon } from './Icons';

interface ImageProcessorCardProps {
  image: ProcessedImage;
}

const ResultImage: React.FC<{ src: string | undefined; label: string; format: string }> = ({ src, label, format }) => (
    <div className="w-1/2 px-1.5">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
            {src ? <img src={src} alt={label} className="w-full h-full object-contain" /> : <div className="bg-gray-200 w-full h-full animate-pulse"></div>}
        </div>
        <p className="text-xs text-center mt-2 text-gray-600">{label}</p>
        <a
            href={src}
            download={`processed_image_${Date.now()}.${format}`}
            className={`w-full mt-2 flex items-center justify-center px-3 py-1.5 text-xs font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 transition-opacity ${!src ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={(e) => !src && e.preventDefault()}
        >
            <DownloadIcon className="w-4 h-4 mr-1" />
            Download
        </a>
    </div>
);


const ImageProcessorCard: React.FC<ImageProcessorCardProps> = ({ image }) => {
    const renderStatus = () => {
        switch(image.status) {
            case 'processing':
                return (
                    <div className="flex items-center text-sm text-yellow-600">
                        <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                    </div>
                );
            case 'completed':
                return (
                    <div className="flex items-center text-sm text-green-600">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Completed
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex items-center text-sm text-red-600">
                        <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                        Error
                    </div>
                );
            case 'pending':
            default:
                return (
                    <div className="flex items-center text-sm text-gray-500">
                        <SpinnerIcon className="w-4 h-4 mr-2 text-gray-300" />
                        Queued
                    </div>
                );
        }
    }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <img src={image.originalUrl} alt="Original" className="w-20 h-20 object-cover rounded-lg border" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 truncate" title={image.file.name}>{image.file.name}</p>
            <p className="text-xs text-gray-500">{(image.file.size / 1024).toFixed(1)} KB</p>
            <div className="mt-2">{renderStatus()}</div>
          </div>
        </div>
        {image.status === 'error' && (
            <p className="mt-3 text-xs text-red-700 bg-red-50 p-2 rounded-md">{image.error}</p>
        )}
        {(image.status === 'completed' || image.status === 'processing') && (
            <div className="mt-4 pt-4 border-t">
                 <div className="flex -mx-1.5">
                    <ResultImage src={image.transparentImageUrl} label="Transparent PNG" format="png" />
                    <ResultImage src={image.whiteBgImageUrl} label="White BG PNG" format="png" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageProcessorCard;
