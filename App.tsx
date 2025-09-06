import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import ResultDisplay from './components/ResultDisplay';
import ImagePreview from './components/ImagePreview';
import { generatePromptFromTrend, createTrendImage } from './services/geminiService';

type LoadingStep = 'analyzing' | 'generating' | null;

const App: React.FC = () => {
    const [trendImage, setTrendImage] = useState<File | null>(null);
    const [faceImage, setFaceImage] = useState<File | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState<string>('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [generatedText, setGeneratedText] = useState<string>('');
    const [initialGeneratedPrompt, setInitialGeneratedPrompt] = useState<string>('');
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
    const [error, setError] = useState<string | null>(null);
    const [numberOfImages, setNumberOfImages] = useState<number>(1);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const startNewTrend = () => {
        setGeneratedImages([]);
        setGeneratedText('');
        setInitialGeneratedPrompt('');
        setGeneratedPrompt('');
        setIsLoading(false);
        setLoadingStep(null);
        setError(null);
    };

    const handleOpenPreview = (index: number) => {
        setPreviewIndex(index);
    };

    const handleClosePreview = () => {
        setPreviewIndex(null);
    };

    const handleNextPreview = () => {
        if (previewIndex !== null) {
            setPreviewIndex((prevIndex) => (prevIndex! + 1) % generatedImages.length);
        }
    };

    const handlePrevPreview = () => {
        if (previewIndex !== null) {
            setPreviewIndex((prevIndex) => (prevIndex! - 1 + generatedImages.length) % generatedImages.length);
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!trendImage || !faceImage) {
            setError('Please upload both a trend image and a face image.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedPrompt('');
        setInitialGeneratedPrompt('');
        setGeneratedText('');

        try {
            setLoadingStep('analyzing');
            const { initialPrompt, finalPrompt } = await generatePromptFromTrend(trendImage, faceImage, additionalInfo);
            setInitialGeneratedPrompt(initialPrompt);
            setGeneratedPrompt(finalPrompt);
            
            setLoadingStep('generating');

            let firstResponseText: string | null = null;

            const generationPromises = Array.from({ length: numberOfImages }).map((_, index) => 
                createTrendImage(finalPrompt, faceImage).then(result => {
                    if (index === 0) {
                        firstResponseText = result.text;
                    }
                    // This will update the UI progressively
                    setGeneratedImages(prev => [...prev, result.imageUrl]);
                    return result;
                })
            );
            
            await Promise.all(generationPromises);
            
            if(firstResponseText) {
                setGeneratedText(firstResponseText);
            }

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Image generation failed. ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingStep(null);
        }
    }, [trendImage, faceImage, additionalInfo, numberOfImages]);

    const getLoadingMessage = (): string => {
        switch (loadingStep) {
            case 'analyzing':
                return 'Analyzing trend to create a prompt...';
            case 'generating':
                return 'Generating your new images... This might take a moment.';
            default:
                return 'Processing...';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl">
                <Header />

                <main className="mt-8">
                    {error && (
                        <div className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-lg relative mb-6" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Initial Form View */}
                    {!isLoading && generatedImages.length === 0 && (
                        <div className="bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ImageUploader
                                    id="trend-uploader"
                                    title="1. Upload Trend Image"
                                    file={trendImage}
                                    onImageUpload={setTrendImage}
                                />
                                <ImageUploader
                                    id="face-uploader"
                                    title="2. Upload Your Image"
                                    file={faceImage}
                                    onImageUpload={setFaceImage}
                                />
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-300">3. Additional Instructions (Optional)</h3>
                                <textarea
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                    placeholder="e.g., 'make it more futuristic', 'use a darker color palette'"
                                    className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-300">4. Number of Images</h3>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setNumberOfImages(num)}
                                            className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors text-lg ${
                                                numberOfImages === num
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!trendImage || !faceImage}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all text-xl shadow-lg hover:shadow-blue-500/50"
                                >
                                    Create My Trend Image
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading view (only before first image appears) */}
                    {isLoading && generatedImages.length === 0 && (
                        <div className="flex justify-center items-center h-64">
                             <Spinner message={getLoadingMessage()} />
                        </div>
                    )}
                    
                    {/* Results view (appears as soon as first image is generated) */}
                    {generatedImages.length > 0 && (
                        <ResultDisplay 
                            imageUrls={generatedImages}
                            text={generatedText}
                            initialPrompt={initialGeneratedPrompt}
                            prompt={generatedPrompt}
                            onReset={startNewTrend}
                            onRegenerate={handleSubmit}
                            isLoading={isLoading}
                            totalImages={numberOfImages}
                            onImageClick={handleOpenPreview}
                        />
                    )}
                </main>
            </div>
             {previewIndex !== null && (
                <ImagePreview
                    imageUrls={generatedImages}
                    currentIndex={previewIndex}
                    onClose={handleClosePreview}
                    onNext={handleNextPreview}
                    onPrev={handlePrevPreview}
                />
            )}
        </div>
    );
};

export default App;