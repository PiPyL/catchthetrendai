import React, { useEffect } from 'react';

interface ImagePreviewProps {
    imageUrls: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrls, currentIndex, onClose, onNext, onPrev }) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight') {
                onNext();
            } else if (e.key === 'ArrowLeft') {
                onPrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, onNext, onPrev]);

    if (currentIndex === null || !imageUrls[currentIndex]) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={onClose}
        >
            {/* Close Button */}
            <button 
                className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-20"
                onClick={onClose}
                aria-label="Close preview"
            >
                &times;
            </button>

            {/* Previous Button */}
            <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 transition-colors p-4 z-20"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                aria-label="Previous image"
            >
                &#8249;
            </button>
            
            {/* Image Container */}
            <div 
                className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            >
                <img 
                    src={imageUrls[currentIndex]} 
                    alt={`Preview ${currentIndex + 1}`} 
                    className="max-w-full max-h-full object-contain"
                />
                 <div className="absolute bottom-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {imageUrls.length}
                </div>
            </div>

            {/* Next Button */}
             <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 transition-colors p-4 z-20"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                aria-label="Next image"
            >
                &#8250;
            </button>
        </div>
    );
};

export default ImagePreview;
