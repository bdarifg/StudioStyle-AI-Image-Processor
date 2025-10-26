import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ProcessedImage } from './types';
import ImageUploader from './components/ImageUploader';
import ImageProcessorCard from './components/ImageProcessorCard';
import ProcessingStatus from './components/ProcessingStatus';
import { removeBackground, addWhiteBackground, fileToBase64 } from './services/geminiService';

const MAX_CONCURRENT_UPLOADS = 3;

const App: React.FC = () => {
    const [images, setImages] = useState<ProcessedImage[]>([]);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    const isProcessingAny = processingIds.size > 0;

    const processImage = useCallback(async (imageToProcess: ProcessedImage) => {
        setProcessingIds(prev => new Set(prev).add(imageToProcess.id));

        try {
            const base64String = await fileToBase64(imageToProcess.file);
            const mimeType = imageToProcess.file.type;

            const [transparentBg, whiteBg] = await Promise.all([
                removeBackground(base64String, mimeType),
                addWhiteBackground(base64String, mimeType)
            ]);

            setImages(prevImages => prevImages.map(img => 
                img.id === imageToProcess.id 
                ? { 
                    ...img, 
                    status: 'completed',
                    transparentImageUrl: `data:image/png;base64,${transparentBg}`,
                    whiteBgImageUrl: `data:image/png;base64,${whiteBg}`
                  } 
                : img
            ));
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            setImages(prevImages => prevImages.map(img =>
                img.id === imageToProcess.id
                ? { ...img, status: 'error', error: error.message }
                : img
            ));
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(imageToProcess.id);
                return newSet;
            });
        }
    }, []);

    useEffect(() => {
        const pendingImages = images.filter(img => img.status === 'pending');
        const availableSlots = MAX_CONCURRENT_UPLOADS - processingIds.size;

        if (pendingImages.length > 0 && availableSlots > 0) {
            const imagesToStart = pendingImages.slice(0, availableSlots);
            for (const image of imagesToStart) {
                 setImages(prevImages => prevImages.map(img =>
                    img.id === image.id ? { ...img, status: 'processing' } : img
                ));
                processImage(image);
            }
        }
    }, [images, processingIds, processImage]);


    const handleFilesSelected = (files: File[]) => {
        const newImages: ProcessedImage[] = files.map(file => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            originalUrl: URL.createObjectURL(file),
            status: 'pending'
        }));
        setImages(prevImages => [...newImages, ...prevImages]);
    };

    const pendingCount = useMemo(() => images.filter(img => img.status === 'pending').length, [images]);
    const processingCount = processingIds.size;

    const memoizedImageCards = useMemo(() => {
        return images.map(image => <ImageProcessorCard key={image.id} image={image} />);
    }, [images]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <header className="text-center mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                        StudioStyle <span className="text-primary-600">AI</span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Batch-process your photos to studio quality. Instant background removal & enhancements for perfect e-commerce shots.
                    </p>
                </header>
                
                <div className="max-w-3xl mx-auto mb-10">
                    <ImageUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessingAny}/>
                    {(pendingCount > 0 || processingCount > 0) && (
                        <div className="mt-6">
                            <ProcessingStatus 
                                pendingCount={pendingCount} 
                                processingCount={processingCount} 
                                concurrencyLimit={MAX_CONCURRENT_UPLOADS} 
                            />
                        </div>
                    )}
                </div>

                {images.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {memoizedImageCards}
                    </div>
                )}
            </main>
            <footer className="text-center py-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">Powered by Gemini 2.5 Flash Image Model</p>
            </footer>
        </div>
    );
};

export default App;