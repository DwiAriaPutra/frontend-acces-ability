/*
Header: DragDropImageZone Component
Tujuan: Reusable drag-drop file upload zone khusus untuk image dengan preview (profile photo).
Caller: Register provider (profile image upload), dashboard provider profil.
Dependensi: React, TailwindCSS.
Props: onImageSelected (callback), preview (image preview URL), error handling.
*/

'use client';

import React, { useRef, useState } from 'react';

interface DragDropImageZoneProps {
  onImageSelected: (file: File) => void;
  preview?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export default function DragDropImageZone({
  onImageSelected,
  preview = '',
  label = 'Unggah Foto Profil',
  disabled = false,
  error = '',
}: DragDropImageZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const validateImage = (file: File): boolean => {
    setLocalError('');

    // Check size (limit: 2MB for images)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setLocalError(`Ukuran file terlalu besar. Max 2MB.`);
      return false;
    }

    // Check type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Tipe file harus JPG, PNG, GIF, atau WebP');
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
      if (validateImage(file)) {
        onImageSelected(file);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateImage(file)) {
        onImageSelected(file);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const displayError = error || localError;

  return (
    <div
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        flex flex-col items-center gap-4 cursor-pointer transition-all
        ${disabled ? 'opacity-50' : ''}
        ${isDragging && !disabled ? 'scale-105' : 'scale-100'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Profile Image Container */}
      <div className={`relative transition-all ${isDragging && !disabled ? 'scale-105' : ''}`}>
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-gray-300 text-5xl">person</span>
          )}
        </div>
        
        {/* Edit Button */}
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`
            absolute bottom-1 right-1 w-10 h-10 bg-brand-green text-white rounded-full 
            flex items-center justify-center shadow-lg border-2 border-white 
            hover:scale-105 active:scale-95 transition-all cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </button>
      </div>

      {/* Label */}
      <span className="mt-2 text-sm font-medium text-gray-500">{label}</span>

      {/* Error message */}
      {displayError && (
        <p className="text-xs text-red-600 font-medium text-center">{displayError}</p>
      )}

      {/* Drag hint */}
      {!disabled && (
        <p className="text-xs text-gray-400">
          Klik untuk memilih atau tarik gambar ke sini
        </p>
      )}
    </div>
  );
}
