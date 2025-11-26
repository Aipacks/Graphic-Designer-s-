import React, { useState, useEffect } from 'react';
import { generateMagicMorphImage } from '../services/geminiService';
import { MagicMorphResult, User, View } from '../types';
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

interface MagicMorphGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const MagicMorphGenerator: React.FC<MagicMorphGeneratorProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<MagicMorphResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedMagicMorphs');
      if (stored) {
        setSavedResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved morphs from localStorage", e);
    }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever savedResults changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedMagicMorphs', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);


  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSourcePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearSource = () => {
    setSourceFile(null);
    setSourcePreview(null);
    const fileInput = document.getElementById('source-upload') as HTMLInputElement;
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

    if (!prompt || !sourceFile) {
      setError('Please provide a prompt and upload a source image.');
      return;
    }
    setError(null);
    setLoading(true);
    setOutputImage(null);
    setCurrentResultId(null);
    try {
      const generatedImage = await generateMagicMorphImage(prompt, sourceFile);
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
      const newResult: MagicMorphResult = {
        id: currentResultId || Date.now().toString(),
        prompt,
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

  const handleLoadResult = (result: MagicMorphResult) => {
    setPrompt(result.prompt);
    setSourcePreview(result.sourceImage);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setSourceFile(null); // Can't restore file object from base64
    setShowHistory(false);
    document.getElementById('morph-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    const safePrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `magic_morph_${safePrompt}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        title: "Apply Any Texture",
        description: "Wood, metal, fire, clouds, fur... if you can describe it, you can apply it to your text or shapes for stunning effects."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
        title: "Restyle with a Prompt",
        description: "Change the entire art style of an image with just a few words. Turn flat text into a 3D chrome masterpiece or a simple icon into a neon sign."
      },
       {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l-1.414-1.414M6.343 6.343l-1.414-1.414m12.728 12.728L12 12m6.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414" /></svg>,
        title: "Creative Exploration",
        description: "Quickly generate dozens of creative variations for logos, typographic posters, icons, or abstract art."
      },
  ];

  const testimonials = [
      {
        quote: "Magic Morph is my new go-to for creating eye-catching text effects for my social media graphics. The 'molten gold' prompt is my absolute favorite!",
        name: "Chloe Davis",
        title: "Social Media Manager"
      },
      {
        quote: "As a logo designer, this tool is incredible for rapid brainstorming. I can show clients multiple textural concepts in minutes. It feels like magic.",
        name: "Kenji Tanaka",
        title: "Brand Designer"
      },
  ];

   const faqs = [
      {
        q: "What kind of images work best?",
        a: "Simple images with high contrast work best, like black text on a white background, or a clean shape or icon. This allows the AI to clearly understand what part of the image to transform."
      },
      {
        q: "How descriptive should my prompt be?",
        a: "Very! The more details you provide, the better. Instead of 'wood', try 'dark oak wood with a glossy finish and deep grain'. Add stylistic words like 'cinematic', 'epic', 'vibrant'."
      },
      {
        q: "Can I use the generated images commercially?",
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
              Transform Anything into Art with a <span className="text-primary">Prompt</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
             Upload text, shapes, or logos and watch them magically transform. Apply incredible textures, styles, and effects with simple written commands.
            </p>
             <button onClick={() => document.getElementById('morph-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Start Morphing
            </button>
             <div className="mt-8 text-sm text-muted">
                Used by Typographers, Logo Designers, and Digital Artists ⭐⭐⭐⭐⭐
            </div>
          </div>
        </section>

        {/* The Tool Section */}
        <section id="morph-tool" className="py-16 bg-surface px-4">
            <div className="container mx-auto max-w-5xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold">Magic Morph</h2>
                    <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                        <HistoryIcon /> History
                    </button>
                </div>
                
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 p-6 border border-border rounded-lg bg-background">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">1. Upload your source</h3>
                        <div className="bg-surface border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center min-h-[200px] h-full">
                            {sourcePreview ? (
                                <div className="relative">
                                    <img src={sourcePreview} alt="Source preview" className="max-h-48 w-auto rounded-md"/>
                                    <button onClick={clearSource} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">&times;</button>
                                </div>
                            ) : (
                                <p className="text-muted text-center">Upload text, a logo, or a simple shape.</p>
                            )}
                        </div>
                        <label htmlFor="source-upload" className="cursor-pointer bg-gray-100 text-text font-bold py-3 px-6 rounded-lg text-center transition-colors hover:bg-gray-200">
                            {sourceFile ? 'Change Image' : 'Upload Image'}
                        </label>
                        <input id="source-upload" type="file" accept="image/*" onChange={handleSourceChange} className="hidden" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">2. Describe the transformation</h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Make this look like it's made of molten gold', 'Turn this into a fluffy cloud'"
                            rows={10}
                            className="w-full h-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                <button onClick={handleGenerate} disabled={loading || !sourceFile || !prompt} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {loading ? 'Transforming...' : 'Transform'}
                </button>
                </div>
                {currentUser?.plan === 'Starter' && <p className="text-sm text-muted mb-8">This will cost 1 credit. You have {currentUser.credits} credits remaining.</p>}

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading && <Spinner />}

                {outputImage && (
                <div className="w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text">Morphed Image</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadImage} title="Download Image" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                        <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                        </button>
                    </div>
                    </div>
                    <img src={outputImage} alt="Morphed result" className="w-full h-auto rounded-xl shadow-lg" />
                </div>
                )}
            </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto">
             <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text">Unleash Your Imagination</h2>
                <p className="text-muted max-w-2xl mx-auto mt-2">Create visuals you've only dreamed of.</p>
            </div>
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
             <h2 className="text-3xl font-bold mb-10">Why Designers Love Magic Morph</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Create the Impossible?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop searching for the right asset and start creating it. Try Magic Morph now and bring your wildest ideas to life.</p>
                <button onClick={() => document.getElementById('morph-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Start Creating For Free
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
                                <img src={result.outputImage} alt={result.prompt} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                  <p className="font-semibold text-text truncate">{result.prompt}</p>
                                  <p className="text-xs text-muted">{new Date(result.timestamp).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => handleDeleteResult(result.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoadResult(result)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved results yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};