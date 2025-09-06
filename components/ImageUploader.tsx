import React, { useState, useRef, useEffect } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File | null) => void;
    title: string;
    id: string;
    file: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title, id, file }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (file) {
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);
            return () => {
                URL.revokeObjectURL(newPreviewUrl);
            };
        } else {
            setPreviewUrl(null);
        }
    }, [file]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        onImageUpload(selectedFile || null);
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleAreaClick = () => {
        fileInputRef.current?.click();
    };

    const fileName = file ? file.name : '';
    
    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">{title}</h3>
            <div
                onClick={handleAreaClick}
                className="w-full h-48 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-700 transition-colors"
            >
                <input
                    type="file"
                    id={id}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-md" />
                ) : (
                    <div className="text-center text-gray-500 p-4">
                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L16 20m12-12v12m0 0h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>Click to upload an image</p>
                        <p className="text-xs mt-1">PNG, JPG, WEBP</p>
                    </div>
                )}
            </div>
             {fileName && <p className="text-sm text-gray-400 mt-2 truncate">{fileName}</p>}
        </div>
    );
};

export default ImageUploader;