import React, { useState, useEffect } from 'react';
import { enhanceImage } from '../services/geminiService';
import { ImageEnhancerResult, User, View } from '../types';
import { Spinner } from './common/Spinner';

// SVG Icon Components
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const beautifyStyles = [
    { name: 'None', icon: '🚫' },
    { name: 'Movie', thumbnail: 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Glam', thumbnail: 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Cute', thumbnail: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Natural', thumbnail: 'https://images.pexels.com/photos/2787341/pexels-photo-2787341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Silk', thumbnail: 'https://images.pexels.com/photos/2860893/pexels-photo-2860893.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { name: 'Charm', thumbnail: 'https://images.pexels.com/photos/1082962/pexels-photo-1082962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

interface ImageEnhancerProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedStyle, setSelectedStyle] = useState<string>('None');

  const [savedResults, setSavedResults] = useState<ImageEnhancerResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedImageEnhancements');
      if (stored) setSavedResults(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedImageEnhancements', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceFile(file);
      setOutputImage(null);
      setCurrentResultId(null);
      setSelectedStyle('None');
      const reader = new FileReader();
      reader.onloadend = () => setSourcePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNewImage = () => {
    setSourceFile(null);
    setSourcePreview(null);
    setOutputImage(null);
    setError(null);
    setSliderPosition(50);
    setSelectedStyle('None');
    setCurrentResultId(null);
    const fileInput = document.getElementById('image-upload-enhancer') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  const handleGenerate = async (style: string) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const creditsNeeded = 1;
    if (currentUser?.plan === 'Starter' && (currentUser.credits === undefined || currentUser.credits < creditsNeeded)) {
        setError(`You need ${creditsNeeded} credit for this. Upgrade to Pro for unlimited generations.`);
        return;
    }
    if (!sourceFile && !sourcePreview) { // Allow regeneration from preview
      setError('Please upload an image first.');
      return;
    }

    setError(null);
    setLoading(true);
    setCurrentResultId(null); // New generation is not a saved item
    setSelectedStyle(style);

    try {
      // Use sourceFile if available, otherwise reconstruct from preview for re-generations on loaded items
      const fileToProcess = sourceFile || await (async () => {
        if (!sourcePreview) throw new Error("No image source available.");
        const response = await fetch(sourcePreview);
        const blob = await response.blob();
        return new File([blob], "source_image.png", { type: blob.type });
      })();

      const generatedImage = await enhanceImage(fileToProcess, style);
      setOutputImage(generatedImage);
      if (currentUser?.plan === 'Starter') {
          onDeductCredits(creditsNeeded);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };


  const handleSaveResult = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (outputImage && sourcePreview) {
      const newResult: ImageEnhancerResult = {
        id: currentResultId || Date.now().toString(),
        sourceImage: sourcePreview,
        outputImage,
        timestamp: Date.now(),
      };
      
      if (savedResults.some(r => r.id === currentResultId)) {
        setSavedResults(results => results.map(r => r.id === currentResultId ? newResult : r));
      } else {
        setSavedResults([newResult, ...savedResults]);
        setCurrentResultId(newResult.id);
      }
    }
  };

  const handleLoadResult = (result: ImageEnhancerResult) => {
    setSourcePreview(result.sourceImage);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setSelectedStyle('None'); // Reset style on load, as we don't save it
    setSourceFile(null); // Can't restore file object from base64
    setShowHistory(false);
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    link.download = `image_enhanced_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
        <section className="text-center py-8 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              8K AI Photo & Face Enhancer
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted">
              Restore photos, sharpen details, and apply professional styles. Our AI detects all faces and bodies to enhance them with stunning clarity.
            </p>
          </div>
        </section>

        <section className="py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Toolbar */}
                    <div className="lg:col-span-3 bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">AI Toolbar</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={handleNewImage} className="text-gray-300 hover:text-white text-xs font-semibold bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md">
                                    New Image
                                </button>
                                <button onClick={() => setShowHistory(true)} className="text-gray-400 hover:text-white" aria-label="View history">
                                    <HistoryIcon />
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-10 h-10 bg-purple-400/20 text-purple-300 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0112.28 0C16.43 19.18 14.03 20 12 20z"></path></svg>
                                </span>
                                <h3 className="text-lg font-semibold">Face Enhance</h3>
                            </div>
                            <p className="text-xs text-gray-400 mb-4">Upscales to 8K quality. Applied to faces &amp; bodies.</p>
                             <button onClick={() => handleGenerate('None')} disabled={loading || !sourcePreview} className={`w-full text-center py-2 px-4 rounded-lg font-semibold transition-colors ${selectedStyle === 'None' ? 'bg-gray-600 text-white' : 'bg-gray-700 hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                Base Enhance
                            </button>
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-4">
                               <span className="w-10 h-10 bg-pink-400/20 text-pink-300 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"></path></svg>
                                </span>
                                <h3 className="text-lg font-semibold">Beautify</h3>
                           </div>
                            <div className="grid grid-cols-3 gap-3">
                                {beautifyStyles.map(style => (
                                    <button 
                                        key={style.name} 
                                        onClick={() => handleGenerate(style.name)}
                                        disabled={loading || !sourcePreview}
                                        className={`relative aspect-square flex flex-col items-center justify-center rounded-md transition-all duration-200 ${loading && selectedStyle === style.name ? 'animate-pulse' : ''} ${selectedStyle === style.name ? 'ring-2 ring-primary' : 'ring-1 ring-gray-600 hover:ring-primary/50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={style.name}
                                    >
                                        {style.thumbnail ? (
                                            <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover rounded-md"/>
                                        ) : (
                                            <div className="bg-gray-700 w-full h-full flex items-center justify-center rounded-md text-2xl">{style.icon}</div>
                                        )}
                                        <div className="absolute bottom-0 w-full bg-black/50 text-white text-xs text-center py-1 rounded-b-md">{style.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Image Area */}
                    <div className="lg:col-span-9 flex flex-col items-center justify-center bg-background rounded-lg shadow-lg border border-border p-4 min-h-[60vh]">
                        {loading && <Spinner />}
                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        {!loading && !sourcePreview && (
                             <label htmlFor="image-upload-enhancer" className="w-full max-w-md cursor-pointer bg-surface text-text font-bold py-4 px-6 rounded-lg text-center transition-colors hover:bg-gray-100 border-2 border-dashed border-border flex flex-col items-center justify-center h-64">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                Upload an Image to Enhance
                                <p className="text-sm font-normal text-muted mt-2">Works best with portraits and photos of people.</p>
                            </label>
                        )}
                        <input id="image-upload-enhancer" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

                        {!loading && sourcePreview && (
                            <div className="w-full max-w-3xl flex flex-col items-center">
                                <div className="relative w-full aspect-square group select-none mb-4">
                                    <img src={sourcePreview} alt="Original" className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-lg pointer-events-none" />
                                    {outputImage && (
                                        <>
                                        <div className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-lg pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                                             <img src={outputImage} alt="Enhanced" className="absolute inset-0 w-full h-full object-contain" />
                                        </div>
                                        <div className="absolute inset-y-0 w-1 bg-white/80 backdrop-blur-sm cursor-ew-resize" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
                                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 bg-white rounded-full shadow-md grid place-items-center">
                                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                                            </div>
                                        </div>
                                        <input type="range" min="0" max="100" value={sliderPosition} onInput={(e) => setSliderPosition(Number(e.currentTarget.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" aria-label="Before and after slider"/>
                                        </>
                                    )}
                                </div>
                                
                                {outputImage && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleDownloadImage} title="Download PNG" className="flex items-center gap-2 bg-white text-text font-bold py-2 px-4 rounded-lg transition-colors hover:bg-gray-100 border border-border"><DownloadIcon /> Download</button>
                                        <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                                        <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
      </div>

      {/* History Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out ${showHistory ? 'translate-x-0' : 'translate-x-full'} z-50 flex flex-col`}>
          <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-xl font-bold text-text">History</h3>
              <button onClick={() => setShowHistory(false)} className="text-text font-bold text-2xl">&times;</button>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
              {savedResults.length > 0 ? (
                  <ul className="space-y-4">
                      {savedResults.map(result => (
                          <li key={result.id} className="bg-background border border-border p-3 rounded-lg group">
                              <div className="flex items-start gap-3">
                                <img src={result.outputImage} alt="Saved result" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                  <p className="font-semibold text-text truncate">Enhancement from {new Date(result.timestamp).toLocaleDateString()}</p>
                                  <p className="text-xs text-muted">{new Date(result.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <button onClick={() => handleDeleteResult(result.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoadResult(result)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved enhancements yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};