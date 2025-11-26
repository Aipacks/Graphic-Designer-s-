import React, { useState, useEffect } from 'react';
import { generateStyledImage, generateStylePromptsForImage } from '../services/geminiService';
import { AIDreamStylistResult, User, View } from '../types';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';

// SVG Icon Components
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const PreviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const RegenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>

interface AIDreamStylistProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const AIDreamStylist: React.FC<AIDreamStylistProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [outputImages, setOutputImages] = useState<string[]>([]);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [promptLoading, setPromptLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<AIDreamStylistResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [regenerationCount, setRegenerationCount] = useState(10);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aiDreamStylistHistory');
      if (stored) setSavedResults(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('aiDreamStylistHistory', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceFile(file);
      setOutputImages([]);
      setPromptSuggestions([]);
      setCurrentResultId(null);
      setError(null);
      setRegenerationCount(10);

      const reader = new FileReader();
      reader.onloadend = () => setSourcePreview(reader.result as string);
      reader.readAsDataURL(file);

      if (!isAuthenticated) {
        onAuthRequired();
        return;
      }
      
      setPromptLoading(true);
      try {
        const prompts = await generateStylePromptsForImage(file);
        setPromptSuggestions(prompts);
      } catch (err: any) {
        setError(err.message || 'Failed to generate prompts.');
      } finally {
        setPromptLoading(false);
      }
    }
  };

  const handleGenerate = async (promptOverride?: string) => {
    const currentPrompt = promptOverride || prompt;

    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const creditsNeeded = 1;
    if (currentUser?.plan === 'Starter' && (currentUser.credits === undefined || currentUser.credits < creditsNeeded)) {
      setError(`You need ${creditsNeeded} credit for this. Upgrade to Pro for unlimited generations.`);
      return;
    }
    if (regenerationCount <= 0) {
        setError("You've reached the regeneration limit for this image. Upload a new image or load one from history to get more tries.");
        return;
    }
    if (!currentPrompt || (!sourceFile && !sourcePreview)) {
      setError('Please provide a style description and upload a photo.');
      return;
    }
    setError(null);
    setLoading(true);

    const isUpdating = !!currentResultId;
    setOutputImages([]);
    
    try {
      let fileToProcess: File;
      if (sourceFile) {
        fileToProcess = sourceFile;
      } else if (sourcePreview) {
        const response = await fetch(sourcePreview);
        const blob = await response.blob();
        fileToProcess = new File([blob], "source_image.png", { type: blob.type });
      } else {
        throw new Error("No image source available.");
      }

      const images = await generateStyledImage(currentPrompt, fileToProcess);
      setOutputImages(images);

      if (isUpdating && sourcePreview) {
        const updatedResult: AIDreamStylistResult = {
          id: currentResultId,
          timestamp: Date.now(),
          prompt: currentPrompt,
          sourceImage: sourcePreview,
          outputImage: images,
          promptSuggestions,
        };
        setSavedResults(prevResults =>
          prevResults.map(item => item.id === currentResultId ? updatedResult : item)
        );
      }

      if (currentUser?.plan === 'Starter') {
        onDeductCredits(creditsNeeded);
      }
      setRegenerationCount(prev => prev - 1);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (loading || promptLoading) return;
    setPrompt(suggestion);
    handleGenerate(suggestion);
  };

  const handleSave = () => {
    if (outputImages.length > 0 && sourcePreview) {
      const newResult: AIDreamStylistResult = {
        id: currentResultId || Date.now().toString(),
        timestamp: Date.now(),
        prompt,
        sourceImage: sourcePreview,
        outputImage: outputImages,
        promptSuggestions,
      };

      if (currentResultId) {
        // Update existing item
        setSavedResults(prevResults =>
          prevResults.map(item => item.id === currentResultId ? newResult : item)
        );
      } else {
        // Save new item
        setSavedResults(prevResults => [newResult, ...prevResults]);
        setCurrentResultId(newResult.id);
      }
    }
  };


  const handleLoad = (item: AIDreamStylistResult) => {
    setPrompt(item.prompt);
    setSourcePreview(item.sourceImage);
    setOutputImages(item.outputImage);
    setPromptSuggestions(item.promptSuggestions || []);
    setCurrentResultId(item.id);
    setSourceFile(null);
    setShowHistory(false);
    setRegenerationCount(10);
  };

  const handleDelete = (id: string) => {
    setSavedResults(p => p.filter(item => item.id !== id));
  };
  
  const handleDownload = (imgSrc: string, index: number) => {
    const link = document.createElement('a');
    link.href = imgSrc;
    const safePrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `dream_style_${safePrompt}_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savedItem = currentResultId ? savedResults.find(item => item.id === currentResultId) : null;
  const isCurrentlySaved = savedItem ? (savedItem.prompt === prompt && JSON.stringify(savedItem.outputImage) === JSON.stringify(outputImages)) : false;

  const getSaveButtonState = () => {
    if (outputImages.length === 0) return { text: 'Save', disabled: true };
    if (isCurrentlySaved) return { text: 'Saved', disabled: true };
    if (currentResultId) return { text: 'Update', disabled: false };
    return { text: 'Save', disabled: false };
  };

  const { text: saveButtonText, disabled: saveButtonDisabled } = getSaveButtonState();
  const finalSaveButtonDisabled = !isAuthenticated || loading || saveButtonDisabled;

  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">AI Dream Stylist</h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
              Your personal AI fashion designer. Upload a photo, describe your dream outfit, and see yourself in a whole new style.
            </p>
          </div>
        </section>

        {/* The Tool Section */}
        <section className="py-16 bg-surface px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="w-full flex justify-end items-center mb-4">
              <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                <HistoryIcon /> History
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Column */}
              <div className="bg-background p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-4">1. Upload Your Photo</h3>
                <div className="w-full relative group bg-surface border-2 border-dashed border-border rounded-lg flex items-center justify-center min-h-[200px]">
                    {sourcePreview ? (
                        <>
                            <img src={sourcePreview} alt="Source" className="max-h-48 w-auto rounded-md" />
                            <label htmlFor="source-upload" className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg text-lg">
                                Change Photo
                            </label>
                        </>
                    ) : (
                        <label htmlFor="source-upload" className="w-full h-full cursor-pointer flex flex-col items-center justify-center text-muted hover:text-primary transition-colors p-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            Click to upload an image
                        </label>
                    )}
                </div>
                <input id="source-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

                <h3 className="font-bold text-lg mb-4 mt-6">2. Describe Your Style</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'A vintage 1920s flapper dress with sequins', 'A futuristic cyberpunk jacket with neon lights'"
                  rows={4}
                  className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!sourcePreview}
                />
                 <button onClick={() => handleGenerate()} disabled={loading || !sourcePreview || !prompt} className="w-full mt-4 bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                  {loading ? 'Styling...' : 'Generate Style'}
                </button>
                {currentUser?.plan === 'Starter' && <p className="text-sm text-muted text-center mt-2">Cost: 1 credit. You have {currentUser.credits || 0} left.</p>}
              </div>

              {/* Output Column */}
              <div className="space-y-6">
                 {(promptLoading || promptSuggestions.length > 0) && (
                   <Card>
                      <h3 className="font-bold text-lg mb-2">AI Style Suggestions</h3>
                      {promptLoading ? <Spinner/> : (
                        <div className="space-y-2">
                            {promptSuggestions.map((suggestion, index) => (
                                <button 
                                  key={index} 
                                  onClick={() => handleSuggestionClick(suggestion)} 
                                  disabled={loading || promptLoading}
                                  className="w-full text-left bg-background p-3 rounded-lg hover:bg-gray-200 transition-colors text-muted hover:text-text disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <p className="italic">"{suggestion}"</p>
                                </button>
                            ))}
                        </div>
                      )}
                   </Card>
                 )}
                 {(loading || outputImages.length > 0) && (
                  <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Styled Variations</h3>
                        <div className="flex items-center gap-2">
                           {outputImages.length > 0 && !loading && (
                            <button onClick={() => handleGenerate()} disabled={loading || !sourcePreview || !prompt || regenerationCount <= 0} className="bg-gray-100 text-text font-bold py-2 px-4 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2">
                                <RegenerateIcon />
                                Regenerate ({regenerationCount} left)
                            </button>
                           )}
                            <button onClick={handleSave} disabled={finalSaveButtonDisabled} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                              <SaveIcon/> {saveButtonText}
                            </button>
                        </div>
                    </div>
                     {loading ? <Spinner/> : (
                       <div className="grid grid-cols-2 gap-4">
                         {outputImages.map((img, index) => (
                           <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg aspect-square">
                             <img src={img} alt={`Styled variation ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                             <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => setSelectedImage(img)} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70" aria-label="Preview image"><PreviewIcon /></button>
                                 <button onClick={() => handleDownload(img, index)} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70" aria-label="Download image"><DownloadIcon /></button>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                  </Card>
                 )}
                 {error && <p className="text-red-500 text-center">{error}</p>}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* History Panel */}
       <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface shadow-2xl transform transition-transform duration-300 ${showHistory ? 'translate-x-0' : 'translate-x-full'} z-50 flex flex-col`}>
          <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-xl font-bold text-text">History</h3>
              <button onClick={() => setShowHistory(false)} className="text-text font-bold text-2xl">&times;</button>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
              {savedResults.length > 0 ? (
                  <ul className="space-y-4">
                      {savedResults.map(item => (
                          <li key={item.id} className="bg-background border border-border p-3 rounded-lg group">
                              <div className="flex items-start gap-3">
                                <img src={item.outputImage[0]} alt={item.prompt} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                  <p className="font-semibold text-text truncate">{item.prompt}</p>
                                  <p className="text-xs text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoad(item)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved styles yet.</p>
              )}
          </div>
      </div>
      {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img src={selectedImage} alt="Styled image preview" className="rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
             <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold">&times;</button>
          </div>
        </div>
      )}
    </>
  );
};
