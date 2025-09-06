import React from 'react';
import Spinner from './Spinner';

interface ResultDisplayProps {
    imageUrls: string[];
    text: string;
    initialPrompt: string;
    prompt: string;
    onReset: () => void;
    onRegenerate: () => void;
    isLoading: boolean;
    totalImages: number;
    onImageClick: (index: number) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrls, text, initialPrompt, prompt, onReset, onRegenerate, isLoading, totalImages, onImageClick }) => {
    // Create an array representing all potential image slots
    const imageSlots = Array.from({ length: totalImages });

    return (
        <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">
                {isLoading ? `Generating Images... (${imageUrls.length}/${totalImages})` : 'Your Trend Images are Ready!'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
                {imageSlots.map((_, index) => {
                    const imageUrl = imageUrls[index];
                    return (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-900 flex flex-col justify-center items-center relative">
                            {imageUrl ? (
                                <>
                                    <img 
                                        src={imageUrl} 
                                        alt={`AI-generated trend image ${index + 1}`} 
                                        className="w-full h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
                                        onClick={() => onImageClick(index)}
                                    />
                                    <a
                                        href={imageUrl}
                                        download={`ai-trend-image-${index + 1}.png`}
                                        className="absolute bottom-0 left-0 right-0 text-center bg-blue-600/80 hover:bg-blue-700/80 text-white font-bold py-2 px-4 transition-colors text-sm"
                                    >
                                        Download
                                    </a>
                                </>
                            ) : (
                                <div className="p-4">
                                    <Spinner message="Generating..." />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="w-full max-w-sm space-y-4">
                 <button
                    onClick={onRegenerate}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Regenerate'}
                </button>
                <button
                    onClick={onReset}
                    disabled={isLoading}
                    className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Start New Trend
                </button>
            </div>
        </div>
    );
};

export default ResultDisplay;