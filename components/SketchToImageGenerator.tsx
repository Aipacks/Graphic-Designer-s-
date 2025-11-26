import React, { useState, useEffect } from 'react';
import { generateImageFromSketch } from '../services/geminiService';
import { SketchToImageResult, User, View } from '../types';
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

interface SketchToImageGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const SketchToImageGenerator: React.FC<SketchToImageGeneratorProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<SketchToImageResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedSketches');
      if (stored) {
        setSavedResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved sketches from localStorage", e);
    }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever savedResults changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedSketches', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);


  const handleSketchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSketchFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSketchPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearSketch = () => {
    setSketchFile(null);
    setSketchPreview(null);
    const fileInput = document.getElementById('sketch-upload') as HTMLInputElement;
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

    if (!prompt || !sketchFile) {
      setError('Please provide a prompt and upload a sketch.');
      return;
    }
    setError(null);
    setLoading(true);
    setOutputImage(null);
    setCurrentResultId(null);
    try {
      const generatedImage = await generateImageFromSketch(prompt, sketchFile);
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
    if (outputImage && sketchPreview) {
      const newResult: SketchToImageResult = {
        id: currentResultId || Date.now().toString(),
        prompt,
        sketch: sketchPreview,
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

  const handleLoadResult = (result: SketchToImageResult) => {
    setPrompt(result.prompt);
    setSketchPreview(result.sketch);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setSketchFile(null); // Can't restore file object from base64
    setShowHistory(false);
    document.getElementById('sketch-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    const safePrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `generated_image_${safePrompt}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        title: "Accelerate Your Workflow",
        description: "Go from a napkin sketch to a client-ready concept in minutes, not hours. Perfect for rapid ideation and exploration."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
        title: "Explore Endless Styles",
        description: "Want it photorealistic? Cartoonish? A watercolor painting? Describe any style and watch the AI adapt your sketch."
      },
       {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
        title: "High-Resolution Output",
        description: "Generate high-quality, detailed images perfect for portfolios, presentations, or as a base for further refinement in your favorite editor."
      },
  ];

  const testimonials = [
      {
        quote: "Sketch to Image has fundamentally changed how I approach concept art. I can iterate on ideas faster than ever before, showing clients multiple detailed options in a fraction of the time.",
        name: "Elena Rodriguez",
        title: "Concept Artist"
      },
      {
        quote: "I'm not a great artist, but I have a lot of ideas. This tool bridges that gap perfectly. I can doodle a rough layout and get a beautiful, polished illustration to work with.",
        name: "David Chen",
        title: "Indie Game Developer"
      },
  ];

   const faqs = [
      {
        q: "What kind of sketches work best?",
        a: "Simple, clean line drawings work best. Clear outlines of your subject without too much shading or messy lines will give the AI the clearest instruction to follow. Black ink on a white background is ideal."
      },
      {
        q: "How descriptive should my prompt be?",
        a: "The more descriptive, the better! Include details about the style (e.g., 'photorealistic', 'anime style', 'watercolor painting'), color, lighting ('cinematic lighting'), and the overall mood."
      },
      {
        q: "Can I use the generated images commercially?",
        a: "Yes, you are free to use the images generated in your personal and commercial projects, according to our terms of service."
      },
      {
        q: "How are my creations stored?",
        a: "Your saved generations are stored securely in your browser's local storage. This means they are private to you and accessible whenever you use the same browser on your device."
      },
  ];

  const pageUrl = "https://aistudio.google.com/";
  const shareText = "I just turned my drawing into a masterpiece with this AI Sketch to Image tool!";
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareText)}`;


  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
        {/* Section 1: Hero */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              From Rough Sketch to Polished Art. <span className="text-primary">Instantly.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
             Stop wrestling with complex software. Upload your sketch, describe your vision, and let our AI bring your ideas to life in stunning detail.
            </p>
             <button onClick={() => document.getElementById('sketch-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Start Creating Now
            </button>
            <div className="mt-8 text-sm text-muted">
                Loved by Illustrators, Concept Artists, and Designers Worldwide ⭐⭐⭐⭐⭐
            </div>
          </div>
        </section>

        {/* Section 2: The Tool */}
        <section id="sketch-tool" className="py-16 bg-surface px-4">
          <div className="container mx-auto max-w-5xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Image Generator</h2>
              <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View my creations">
                  <HistoryIcon /> My Creations
              </button>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 p-6 border border-border rounded-lg bg-background">
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-lg">1. Your Instructions</h3>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the final image... (e.g., 'A photorealistic cat, sitting on a red velvet chair, detailed fur')"
                        rows={4}
                        className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <label htmlFor="sketch-upload" className="cursor-pointer bg-gray-100 text-text font-bold py-3 px-6 rounded-lg text-center transition-colors hover:bg-gray-200">
                        {sketchFile ? 'Change Sketch' : 'Upload Sketch'}
                    </label>
                    <input id="sketch-upload" type="file" accept="image/*" onChange={handleSketchChange} className="hidden" />
                </div>
                <div className="flex flex-col gap-4">
                     <h3 className="font-semibold text-lg">2. Your Sketch</h3>
                    <div className="bg-surface border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center min-h-[200px] h-full">
                        {sketchPreview ? (
                            <div className="relative">
                                <img src={sketchPreview} alt="Sketch preview" className="max-h-48 w-auto rounded-md"/>
                                <button onClick={clearSketch} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">&times;</button>
                            </div>
                        ) : (
                            <p className="text-muted text-center">Your sketch will appear here</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={handleGenerate} disabled={loading || !sketchFile || !prompt} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {loading ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
             {currentUser?.plan === 'Starter' && <p className="text-sm text-muted mb-8">This will cost 1 credit. You have {currentUser.credits} credits remaining.</p>}

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <Spinner />}

            {outputImage && (
              <div className="w-full max-w-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text">Generated Image</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handleDownloadImage} title="Download Image" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                    <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                      <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
                <img src={outputImage} alt="Generated from sketch" className="w-full h-auto rounded-xl shadow-lg" />
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Features */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text">Unleash Your Creativity</h2>
                <p className="text-muted max-w-2xl mx-auto mt-2">Go from idea to final art faster than ever.</p>
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

         {/* Section 4: Testimonials */}
        <section className="py-16 bg-surface px-4">
          <div className="container mx-auto text-center">
             <h2 className="text-3xl font-bold mb-10">Why Creatives Love This Tool</h2>
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

        {/* Section 5: FAQs */}
        <section className="py-16 px-4 bg-background">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                <div>
                    {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                </div>
            </div>
        </section>

         {/* Section 6: CTA & Sharing */}
        <section className="py-16 text-center bg-surface px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-4">Ready to Bring Your Sketches to Life?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop imagining and start creating. Generate your first masterpiece now.</p>
                <button onClick={() => document.getElementById('sketch-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Start Creating for Free
                </button>
                <div className="mt-10">
                    <p className="text-sm font-semibold text-muted mb-3">SHARE THIS TOOL</p>
                    <div className="flex justify-center gap-4">
                        <a href={shareTwitter} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="Share on X">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.65 19.57h2.61L6.774 3.078h-2.61l13.318 17.645z" /></svg>
                        </a>
                        <a href={shareFacebook} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="Share on Facebook">
                           <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg>
                        </a>
                        <a href={shareLinkedIn} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="Share on LinkedIn">
                           <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.5 2.5-2.5c1.6 0 2.5 1.2 2.5 2.5 0 1.3-1 2.5-2.5 2.5zm11.5 6c-1 0-2 1-2 2v7h-5v-13h5V10s1.6-1.5 4-1.5c3 0 5 2.2 5 6.5v6.5h-5v-7c0-1-1-2-2-2z" /></svg>
                        </a>
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