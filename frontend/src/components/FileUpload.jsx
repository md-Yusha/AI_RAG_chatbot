import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiFile, FiX, FiCheck, FiFileText } from 'react-icons/fi';

const FileUpload = ({ onFileUpload, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [recentFile, setRecentFile] = useState(null);

  const isValidFileType = (file) => {
    const validTypes = ['application/pdf', 'text/plain'];
    const fileType = file.type || '';
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    return validTypes.includes(fileType) || ['pdf', 'txt'].includes(fileExt);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const processFile = (file) => {
    if (!isValidFileType(file)) {
      alert('Please upload a PDF or TXT file.');
      return;
    }
    
    setRecentFile({
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'text'
    });
    
    onFileUpload(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      e.target.value = null; // Reset input
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const FileIcon = ({ type }) => {
    const color = type === 'pdf' ? 'text-red-500' : 'text-blue-500';
    
    return (
      <div className={`${color} mr-2`}>
        <FiFileText className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          group relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 ' +
               'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
          cursor-pointer`}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400">
            <FiUpload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {isDragging ? 'Drop your file here' : 'Drag & drop files here or click to browse'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supports PDF and TXT files
            </p>
          </div>
        </div>
        
        {recentFile && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center">
            <FileIcon type={recentFile.type} />
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1">
              {recentFile.name}
            </span>
            <FiCheck className="w-4 h-4 text-green-500 ml-2" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
