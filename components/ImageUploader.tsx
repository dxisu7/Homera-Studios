import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  currentPreview: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, currentPreview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer rounded-lg border-2 border-dashed transition-all duration-300
        ${currentPreview 
          ? 'border-zinc-700 bg-zinc-900 hover:border-zinc-500' 
          : 'border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-900/50'
        }
        h-48 flex flex-col items-center justify-center overflow-hidden
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />

      {currentPreview ? (
        <>
          <img 
            src={currentPreview} 
            alt="Preview" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-xs font-medium flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Change Image
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-zinc-700 transition-colors">
            <ImageIcon className="w-6 h-6 text-zinc-400 group-hover:text-yellow-500 transition-colors" />
          </div>
          <p className="text-sm font-medium text-zinc-300">Click or drag image here</p>
          <p className="text-xs text-zinc-500 mt-1">Supports JPG, PNG, WEBP</p>
        </div>
      )}
    </div>
  );
};