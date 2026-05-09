/*
Header: DragDropZone Component
Tujuan: Reusable drag-drop file upload zone dengan preview dan error handling.
Caller: Register provider, dashboard provider profil, dan semua halaman dengan file upload.
Dependensi: React, TailwindCSS.
Props: onFileSelected (callback), accept (file types), maxSize (bytes), label, preview, error handling.
*/

'use client';

import React, { useRef, useState } from 'react';

interface DragDropZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  icon?: string;
  selectedFile?: File | null;
  error?: string;
  disabled?: boolean;
}

export default function DragDropZone({
  onFileSelected,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = 'Upload File',
  description = 'Format: PDF, JPG, PNG. Max 5MB',
  icon = 'how_to_reg',
  selectedFile = null,
  error = '',
  disabled = false,
}: DragDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const validateFile = (file: File): boolean => {
    setLocalError('');

    // Check size
    if (file.size > maxSize) {
      setLocalError(`Ukuran file terlalu besar. Max ${formatBytes(maxSize)}.`);
      return false;
    }

    // Check type
    const acceptedTypes = accept.split(',').map((type) => type.trim());
    const fileType = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isAccepted =
      acceptedTypes.some((type) => type === fileType) ||
      acceptedTypes.some((type) => {
        if (type.includes('/')) return mimeType.match(new RegExp(type.replace('*', '.*')));
        return false;
      });

    if (!isAccepted) {
      setLocalError(`Tipe file tidak didukung. Format: ${accept}`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelected(file);
        // Reset input value so same file can be selected again
        e.target.value = '';
      }
    }
  };

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-2xl transition-all cursor-pointer
          flex flex-col items-center text-center p-10
          ${disabled ? 'bg-gray-100 border-gray-200 opacity-50' : ''}
          ${displayError ? 'border-red-300 bg-red-50' : ''}
          ${isDragging && !disabled ? 'border-brand-green bg-green-50 scale-102' : ''}
          ${!isDragging && !displayError && !disabled ? 'border-gray-200 bg-gray-50 hover:border-brand-green hover:bg-green-50/50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        {/* Icon */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
          <span
            className={`material-symbols-outlined text-3xl ${
              selectedFile ? 'text-green-600' : displayError ? 'text-red-600' : 'text-brand-green'
            }`}
          >
            {selectedFile ? 'check_circle' : displayError ? 'error' : icon}
          </span>
        </div>

        {/* Label */}
        <p className="font-bold text-gray-900 mb-1">
          {selectedFile ? selectedFile.name : label}
        </p>

        {/* Description */}
        {!selectedFile && (
          <p className="text-xs text-gray-400 mb-6">{description}</p>
        )}

        {/* File size info if selected */}
        {selectedFile && (
          <p className="text-xs text-gray-500 mb-6">{formatBytes(selectedFile.size)}</p>
        )}

        {/* Error message */}
        {displayError && (
          <p className="text-xs text-red-600 font-medium mb-6">{displayError}</p>
        )}

        {/* Upload button */}
        {!selectedFile && (
          <button
            type="button"
            onClick={(e) => handleClick(e)}
            className="bg-brand-green hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all font-semibold shadow-md inline-flex"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            Pilih File
          </button>
        )}

        {/* Clear button if file selected */}
        {selectedFile && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelected(null as any);
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              setLocalError('');
            }}
            className="bg-red-100 hover:bg-red-200 text-red-600 px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all font-semibold inline-flex"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Hapus File
          </button>
        )}

        {/* Drag hint */}
        {!selectedFile && !disabled && (
          <p className="text-xs text-gray-400 mt-6">atau tarik file ke sini</p>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
