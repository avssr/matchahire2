'use client'

import React, { useRef, useState } from 'react'
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon, LinkIcon } from '@heroicons/react/24/outline'
import { AlertCircle, FileText, Loader2 } from 'lucide-react'
import { UploadedAsset } from '@/types/gpt'
import { ALLOWED_RESUME_TYPES, MAX_FILE_SIZE } from '@/utils/fileUpload'

interface UploadAssetProps {
  onFileSelect: (file: File) => void;
  uploadedAssets: UploadedAsset[];
  onRemoveAsset: (id: string) => void;
  assetType?: 'resume' | 'portfolio' | 'other';
  allowedFileTypes?: string[];
  maxFileSize?: number;
  disabled?: boolean;
}

const UploadAsset: React.FC<UploadAssetProps> = ({
  onFileSelect,
  uploadedAssets,
  onRemoveAsset,
  assetType = 'resume',
  allowedFileTypes = ALLOWED_RESUME_TYPES,
  maxFileSize = MAX_FILE_SIZE,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format file size
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    onFileSelect(file);
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle button click
  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };
  
  const getAssetLabel = () => {
    switch (assetType) {
      case 'resume':
        return 'Resume';
      case 'portfolio':
        return 'Portfolio';
      default:
        return 'File';
    }
  };
  
  return (
    <div className="w-full">
      {/* Uploaded assets */}
      {uploadedAssets.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Attached Files:</h4>
          {uploadedAssets.map(asset => (
            <div 
              key={asset.id} 
              className="flex items-center text-sm bg-gray-50 rounded p-2 border border-gray-200"
            >
              <FileText className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-700">{asset.name}</p>
                
                {asset.status === 'uploading' ? (
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${asset.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{asset.progress}%</span>
                  </div>
                ) : asset.status === 'success' ? (
                  <span className="text-xs text-green-600">Uploaded successfully</span>
                ) : (
                  <div className="flex items-center">
                    <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-red-600">{asset.error || 'Failed to upload'}</span>
                  </div>
                )}
              </div>
              
              {asset.status === 'success' && asset.url && (
                <a 
                  href={asset.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-green-600 hover:underline mr-2 flex items-center"
                >
                  <LinkIcon className="h-3 w-3 mr-1" />
                  View
                </a>
              )}
              
              <button 
                onClick={() => onRemoveAsset(asset.id)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                aria-label="Remove file"
                disabled={disabled}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-all ${
          isDragging 
            ? 'border-green-500 bg-green-50' 
            : disabled
            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            : 'border-gray-300 hover:border-green-400 bg-white cursor-pointer'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <CloudArrowUpIcon className={`h-10 w-10 mb-2 ${
            disabled ? 'text-gray-300' : 'text-green-500'
          }`} />
          
          <h3 className="text-sm font-medium mb-1">
            {isDragging 
              ? `Drop your ${getAssetLabel().toLowerCase()} here` 
              : `Upload your ${getAssetLabel().toLowerCase()}`
            }
          </h3>
          
          <p className="text-xs text-gray-500 mb-2">
            {disabled
              ? 'Upload is currently disabled'
              : `Drag and drop or click to select (max ${formatFileSize(maxFileSize)})`
            }
          </p>
          
          <p className="text-xs text-gray-400">
            {allowedFileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} files accepted
          </p>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={allowedFileTypes.join(',')}
        disabled={disabled}
      />
    </div>
  );
};

export default UploadAsset; 