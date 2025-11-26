import React, { useState, useEffect } from 'react';
import { generateVectorStyleImage } from '../services/geminiService';
import { VectorStyleImageResult } from '../types';
import { Spinner } from './common/Spinner';

// SVG Icon Components
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const styles = ['Flat Icon', 'Isometric Illustration', 'Line Art', 'Corporate Mascot', 'Geometric Pattern', 'Abstract Shape'];
const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

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

// FIX: Add props interface
interface VectorStyleImageGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const VectorStyleImageGenerator: React.FC<VectorStyleImageGeneratorProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>(styles[0]);
  const [aspectRatio, setAspectRatio] = useState<string>(aspectRatios[0]);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<VectorStyleImageResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load/Save hooks
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedVectorImages');
      if (stored) setSavedResults(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedVectorImages', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);

  const handleGenerate = async () => {
    // FIX: Add auth check
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!prompt) {
      setError('Please describe what you want to create.');
      return;
    }
    setError(null);
    setLoading(true);
    setOutputImage(null);
    setCurrentResultId(null);
    try {
      const generatedImage = await generateVectorStyleImage(prompt, style, aspectRatio);
      setOutputImage(generatedImage);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = () => {
    // FIX: Add auth check
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (outputImage) {
      const newResult: VectorStyleImageResult = {
        id: currentResultId || Date.now().toString(),
        prompt,
        style,
        aspectRatio,
        outputImage,
        timestamp: Date.now(),
      };
      if (savedResults.some(r => r.id === currentResultId)) return;
      setSavedResults([newResult, ...savedResults]);
      setCurrentResultId(newResult.id);
    }
  };

  const handleLoadResult = (result: VectorStyleImageResult) => {
    setPrompt(result.prompt);
    setStyle(result.style);
    setAspectRatio(result.aspectRatio);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setShowHistory(false);
    document.getElementById('vector-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    const safePrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `vector_style_${safePrompt}.png`; // download as PNG
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
        title: "Production Quality",
        description: "Generate graphics with clean lines, sharp edges, and a professional aesthetic, ready for any project."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
        title: "Versatile Styles",
        description: "Instantly create everything from flat icons and isometric illustrations to corporate mascots and abstract patterns."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
        title: "Transparent PNGs",
        description: "Get graphics with transparent backgrounds, perfect for layering in your designs for websites, apps, or presentations."
      },
  ];

  const testimonials = [
      {
        quote: "This tool has accelerated my icon design process by 10x. I can generate a full set of high-quality, consistent icons in minutes. It's an absolute game-changer for UI/UX work.",
        name: "Elena Petrova",
        title: "UI/UX Designer"
      },
      {
        quote: "I use this to quickly create spot illustrations for blog posts and social media. The quality is fantastic, and it saves me from hours of searching through stock photo sites.",
        name: "Marcus Wong",
        title: "Content Marketer"
      },
  ];

   const faqs = [
      {
        q: "Does this generate real SVG files?",
        a: "Currently, the tool generates high-resolution PNG files with a transparent background that mimics a clean vector aesthetic. This makes them suitable for most web and digital use cases. True SVG export is on our roadmap!"
      },
      {
        q: "What's the difference between this and a regular image generator?",
        a: "This model is specifically fine-tuned to create images with the characteristics of vector graphics: clean lines, solid colors, and sharp edges. It's optimized for creating logos, icons, and illustrations rather than photorealistic images."
      },
      {
        q: "What prompts work best?",
        a: "Be specific about the subject and the style. For example, instead of 'bird logo', try 'A minimalist line-art logo of a hummingbird in flight, single color'."
      },
  ];

  return (
    <>
     <div className="animate-fade-in -m-6 md:-m-8">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              Generate Scalable Vector Graphics with <span className="text-primary">AI</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
              Create production-ready icons, logos, and illustrations that are clean, sharp, and infinitely scalable.
            </p>
             <button onClick={() => document.getElementById('vector-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Generate a Graphic
            </button>
          </div>
        </section>

        {/* The Tool Section */}
        <section id="vector-tool" className="py-16 bg-surface px-4">
            <div className="container mx-auto max-w-5xl flex flex-col items-center">
                 <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold">Vector Style Generator</h2>
                    <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                        <HistoryIcon /> History
                    </button>
                </div>
                
                <div className="w-full max-w-2xl flex flex-col gap-4 mb-6">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the graphic... (e.g., 'A logo for a coffee shop called The Daily Grind')"
                        rows={3}
                        className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="style-select" className="block text-sm font-medium text-muted mb-1">Style</label>
                            <select id="style-select" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                {styles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="aspect-select" className="block text-sm font-medium text-muted mb-1">Size</label>
                            <select id="aspect-select" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-8">
                <button onClick={handleGenerate} disabled={loading || !prompt} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {loading ? 'Generating...' : 'Generate Graphic'}
                </button>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading && <Spinner />}

                {outputImage && (
                <div className="w-full max-w-lg bg-gray-200 p-4 rounded-lg" style={{backgroundImage: 'repeating-conic-gradient(#D1D5DB 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }}>
                    <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text bg-white/70 px-2 py-1 rounded">Result</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadImage} title="Download PNG" className="flex items-center gap-2 bg-white/70 text-text font-bold p-2 rounded-lg transition-colors hover:bg-white"><DownloadIcon /></button>
                        <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                        <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                        </button>
                    </div>
                    </div>
                    <img src={outputImage} alt="Generated vector-style graphic" className="w-full h-auto rounded-md shadow-lg" />
                </div>
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
             <h2 className="text-3xl font-bold mb-10">The Essential Tool for Modern Designers</h2>
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
                <h2 className="text-3xl font-bold mb-4">Design at the Speed of Thought.</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop drawing, start directing. Generate your next logo, icon set, or illustration with the power of AI.</p>
                <button onClick={() => document.getElementById('vector-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Generate a Graphic for Free
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
                                <div className="w-16 h-16 rounded-md flex-shrink-0 bg-gray-200" style={{backgroundImage: 'repeating-conic-gradient(#E5E7EB 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' }}>
                                    <img src={result.outputImage} alt={result.prompt} className="w-full h-full object-contain" />
                                </div>
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
                  <p className="text-center text-muted mt-8">No saved graphics yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};