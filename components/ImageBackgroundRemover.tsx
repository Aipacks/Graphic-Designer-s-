import React, { useState, useEffect } from 'react';
import { removeImageBackground } from '../services/geminiService';
import { ImageBackgroundRemoverResult, User, View } from '../types';
import { Spinner } from './common/Spinner';

// SVG Icon Components
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left gap-4">
        <h3 className="font-semibold text-text">{q}</h3>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}>
        <p className="text-muted pr-6">{a}</p>
      </div>
    </div>
  );
};

interface ImageBackgroundRemoverProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const ImageBackgroundRemover: React.FC<ImageBackgroundRemoverProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<ImageBackgroundRemoverResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedBgRemovals');
      if (stored) {
        setSavedResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved removals from localStorage", e);
    }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever savedResults changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedBgRemovals', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceFile(file);
      setOutputImage(null);
      setCurrentResultId(null);
      const reader = new FileReader();
      reader.onloadend = () => setSourcePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSourceFile(null);
    setSourcePreview(null);
    setOutputImage(null);
    setCurrentResultId(null);
    const fileInput = document.getElementById('image-upload-remover') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const creditsNeeded = 1;
    if (currentUser?.plan === 'Starter' && (currentUser.credits === undefined || currentUser.credits < creditsNeeded)) {
        setError(`You need ${creditsNeeded} credit for this. Upgrade to Pro for unlimited generations.`);
        return;
    }
    if (!sourceFile) {
      setError('Please upload an image.');
      return;
    }
    setError(null);
    setLoading(true);
    setOutputImage(null);
    setCurrentResultId(null);
    try {
      const generatedImage = await removeImageBackground(sourceFile);
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
      const newResult: ImageBackgroundRemoverResult = {
        id: currentResultId || Date.now().toString(),
        sourceImage: sourcePreview,
        outputImage,
        timestamp: Date.now(),
      };
      
      if (currentResultId) {
        setSavedResults(results => results.map(r => r.id === currentResultId ? newResult : r));
      } else {
        setSavedResults([newResult, ...savedResults]);
        setCurrentResultId(newResult.id);
      }
    }
  };

  const handleLoadResult = (result: ImageBackgroundRemoverResult) => {
    setSourcePreview(result.sourceImage);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setSourceFile(null); // Can't restore file object from base64
    setShowHistory(false);
    document.getElementById('remover-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    link.download = `background_removed_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
        title: "One-Click Magic",
        description: "No complex tools or masking required. Upload your image and let the AI handle the rest with a single click."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm0 0l-1-1m1 1l1-1m-1 1v-1m1 1V6m16 1v1m-1-1l1-1m-1 1l-1-1m1-1v-1m-1 1V6" /></svg>,
        title: "Clean, Precise Cutouts",
        description: "Our AI intelligently identifies the main subject and creates a clean, accurate cutout, even with complex edges like hair or fur."
      },
       {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
        title: "Transparent PNG Output",
        description: "Download a high-resolution PNG with a transparent background, ready to be used in any design, presentation, or social media post."
      },
  ];

  const testimonials = [
      {
        quote: "This is the fastest and most accurate background remover I've ever used. It handles tricky things like hair perfectly. It's saved me countless hours of manual work in Photoshop.",
        name: "Anna Petrova",
        title: "E-commerce Photographer"
      },
      {
        quote: "As a social media manager, I'm constantly creating graphics. This tool lets me quickly isolate products or people for posts. It's an indispensable part of my daily workflow.",
        name: "David Chen",
        title: "Social Media Manager"
      },
  ];

   const faqs = [
      {
        q: "What kind of images work best?",
        a: "Images with a clear subject and a distinct background work best. However, our AI is trained to handle a wide variety of images, including portraits, products, and animals."
      },
      {
        q: "Is there a limit to the image resolution I can upload?",
        a: "While the tool works with most image sizes, for best results we recommend uploading images under 4K resolution. The output will be a high-quality PNG."
      },
      {
        q: "Can I use the resulting images commercially?",
        a: "Yes, you are free to use the images you create in your personal and commercial projects, according to our terms of service."
      },
  ];

  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
         {/* Hero Section */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              Remove Image Backgrounds in a <span className="text-primary">Single Click</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
              No more tedious masking. Upload your image and let our AI create a perfect, transparent cutout in seconds.
            </p>
             <button onClick={() => document.getElementById('remover-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Remove a Background
            </button>
          </div>
        </section>

        {/* The Tool Section */}
        <section id="remover-tool" className="py-16 bg-surface px-4">
            <div className="container mx-auto max-w-5xl flex flex-col items-center">
                 <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold">Background Remover</h2>
                    <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                        <HistoryIcon /> History
                    </button>
                </div>
                {!sourcePreview && (
                <div className="w-full max-w-md my-8">
                    <label htmlFor="image-upload-remover" className="w-full cursor-pointer bg-gray-100 text-text font-bold py-4 px-6 rounded-lg text-center transition-colors hover:bg-gray-200 border-2 border-dashed border-border flex flex-col items-center justify-center h-48">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        Upload an Image
                    </label>
                    <input id="image-upload-remover" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
                )}

                {sourcePreview && (
                <div className="w-full mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center">
                            <h3 className="text-lg font-semibold text-text mb-2">Original</h3>
                            <div className="relative w-full aspect-square bg-background border border-border rounded-lg p-2 flex items-center justify-center">
                                <img src={sourcePreview} alt="Source preview" className="max-h-full max-w-full object-contain rounded-md"/>
                                <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-md">&times;</button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <h3 className="text-lg font-semibold text-text mb-2">Result</h3>
                            <div className="w-full aspect-square bg-gray-200 border border-border rounded-lg p-2 flex items-center justify-center" style={{backgroundImage: 'repeating-conic-gradient(#D1D5DB 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }}>
                                {loading && <Spinner />}
                                {outputImage && !loading && <img src={outputImage} alt="Background Removed" className="max-h-full max-w-full object-contain"/>}
                                {!outputImage && !loading && <p className="text-muted">Click 'Remove Background'</p>}
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {sourceFile && (
                    <>
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <button onClick={handleGenerate} disabled={loading || !sourceFile} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                            {loading ? 'Removing...' : 'Remove Background'}
                        </button>
                         {currentUser?.plan === 'Starter' && <p className="text-sm text-muted mt-2">This will cost 1 credit. You have {currentUser.credits} credits remaining.</p>}
                    </div>

                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    
                    {outputImage && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleDownloadImage} title="Download PNG" className="flex items-center gap-2 bg-gray-100 text-text font-bold py-2 px-4 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /> Download</button>
                            <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                            <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="text-center p-6">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-surface px-4">
          <div className="container mx-auto text-center">
             <h2 className="text-3xl font-bold mb-10">The Ultimate Time-Saver</h2>
             <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               {testimonials.map((t, i) => (
                 <blockquote key={i} className="bg-background p-8 rounded-lg border border-border shadow-sm">
                   <p className="text-lg text-text mb-4 italic">"{t.quote}"</p>
                   <footer className="font-semibold text-muted">&mdash; {t.name}, <span className="text-primary">{t.title}</span></footer>
                 </blockquote>
               ))}
             </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 px-4 bg-background">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                <div>
                    {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 text-center bg-surface px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-4">Ready for Perfect Cutouts?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop wasting time with manual selection tools. Get a clean, transparent background in one click.</p>
                <button onClick={() => document.getElementById('remover-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Remove a Background for Free
                </button>
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
                                <img src={result.outputImage} alt="Saved result" className="w-16 h-16 object-cover rounded-md flex-shrink-0" style={{backgroundImage: 'repeating-conic-gradient(#E5E7EB 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' }}/>
                                <div className="flex-grow overflow-hidden">
                                  <p className="font-semibold text-text truncate">Removal from {new Date(result.timestamp).toLocaleDateString()}</p>
                                  <p className="text-xs text-muted">{new Date(result.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <button onClick={() => handleDeleteResult(result.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoadResult(result)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved removals yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};