import React, { useState, useEffect } from 'react';
import { generateSignature } from '../services/geminiService';
import { SignatureResult } from '../types';
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

// FIX: Add props interface
interface SignatureGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const SignatureGenerator: React.FC<SignatureGeneratorProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [name, setName] = useState<string>('');
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<SignatureResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedSignatures');
      if (stored) {
        setSavedResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved signatures from localStorage", e);
    }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever savedResults changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedSignatures', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);

  const handleGenerate = async () => {
    // FIX: Add auth check
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!name) {
      setError('Please enter a name to generate a signature.');
      return;
    }
    setError(null);
    setLoading(true);
    setOutputImage(null);
    setCurrentResultId(null);
    try {
      const generatedImage = await generateSignature(name);
      setOutputImage(generatedImage);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleGenerate();
    }
  };

  const handleSaveResult = () => {
    // FIX: Add auth check
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (outputImage) {
      const newResult: SignatureResult = {
        id: currentResultId || Date.now().toString(),
        name,
        outputImage,
        timestamp: Date.now(),
      };
      
      if (savedResults.some(r => r.id === currentResultId)) return;

      setSavedResults([newResult, ...savedResults]);
      setCurrentResultId(newResult.id);
    }
  };

  const handleLoadResult = (result: SignatureResult) => {
    setName(result.name);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setShowHistory(false);
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `signature_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const examples = [
    {
      image: "https://storage.googleapis.com/aistudio-public/enterprise_project_995333/alex_johnson_sig_1720734002778.png",
      name: "Alex Johnson",
      style: "Elegant Calligraphy"
    },
    {
      image: "https://storage.googleapis.com/aistudio-public/enterprise_project_995333/isabella_rossi_sig_1720734045544.png",
      name: "Dr. Isabella Rossi",
      style: "Professional & Minimalist"
    },
    {
      image: "https://storage.googleapis.com/aistudio-public/enterprise_project_995333/chris_lee_sig_1720734080132.png",
      name: "Chris Lee",
      style: "Energetic & Modern"
    }
  ];

  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        title: "Instant Creation",
        description: "No need to practice your handwriting for hours. Get a variety of beautiful, clean signatures in just a few seconds."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
        title: "Multiple Styles",
        description: "From elegant calligraphic scripts to modern, minimalist designs, our AI generates a range of styles to perfectly match your personality."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
        title: "Ready to Use",
        description: "Download your signature as a high-resolution PNG with a transparent background, perfect for documents, emails, and branding."
      },
  ];

  const testimonials = [
      {
        quote: "I needed a professional signature for my freelance invoices, and this tool delivered in seconds. It looks so much better than anything I could've drawn myself!",
        name: "Maria Garcia",
        title: "Freelance Consultant"
      },
      {
        quote: "This is so much fun! I created signatures for my whole team for our email footers. It was fast, easy, and everyone loved their unique design.",
        name: "David Chen",
        title: "Startup Founder"
      },
  ];

   const faqs = [
      {
        q: "How does the AI generate my signature?",
        a: "Our AI model has been trained on a vast dataset of handwriting styles. It analyzes the letters in your name and generates a unique, calligraphic-style image that is both artistic and legible."
      },
      {
        q: "Can I use this signature for legal documents?",
        a: "The generated signature is a graphical image. While it's perfect for many uses, the validity of electronic signatures for legal purposes varies by region and document type. Please check your local regulations."
      },
      {
        q: "What format can I download my signature in?",
        a: "You can download your signature as a high-resolution PNG file with a transparent background, making it easy to place on any document or image without a white box around it."
      },
      {
        q: "How is my signature history stored?",
        a: "Your saved signatures are stored securely in your browser's local storage. This means they are private to you and accessible whenever you use the same browser on your device."
      },
  ];

  const pageUrl = "https://aistudio.google.com/";
  const shareText = "I just created a professional signature with this AI Signature Generator!";
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareText)}`;

  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
        {/* Section 1: The Generator Tool */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              Craft Your Perfect Signature in Seconds
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
              Instantly create a unique, professional, handwritten signature. Just type your name, and let our AI design the perfect one for you.
            </p>
            
            <div className="w-full max-w-lg mx-auto flex gap-2 mb-8">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your full name (e.g., Jane Doe)"
                className="flex-grow bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Your name for signature"
              />
              <button onClick={handleGenerate} disabled={loading || !name} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {loading ? '...' : 'Generate'}
              </button>
              <button onClick={() => setShowHistory(true)} className="bg-surface text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border" aria-label="View history">
                <HistoryIcon />
              </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <Spinner />}

            {outputImage && (
              <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text">Your Signature</h3>
                  <div className="flex items-center gap-2">
                     <button onClick={handleDownloadImage} title="Download Image" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                    <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                      <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
                 <div className="bg-gray-200 p-4 rounded-lg" style={{backgroundImage: 'repeating-conic-gradient(#D1D5DB 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }}>
                    <img src={outputImage} alt="Generated signature" className="w-full h-auto" />
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Section 2: Examples/Gallery */}
        <section className="py-16 bg-surface px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Find Your Style</h2>
            <p className="text-muted max-w-2xl mx-auto mb-10">From classic to contemporary, explore a range of AI-generated signature styles.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {examples.map((ex, i) => (
                <div key={i} className="bg-background p-4 rounded-lg border border-border shadow-sm">
                  <div className="bg-white p-4 rounded-md mb-4 flex items-center justify-center h-32">
                     <img src={ex.image} alt={ex.name} className="max-w-full max-h-full"/>
                  </div>
                  <h3 className="font-bold text-lg text-text">{ex.name}</h3>
                  <p className="text-muted text-sm">{ex.style}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Features */}
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

        {/* Section 4: Testimonials */}
        <section className="py-16 bg-surface px-4">
          <div className="container mx-auto text-center">
             <h2 className="text-3xl font-bold mb-10">Trusted by Professionals</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Make Your Mark?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop scribbling and start designing. Generate your professional signature now and elevate your personal brand.</p>
                <button onClick={() => document.querySelector('input')?.focus()} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Generate Your Signature
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
                                <div className="w-16 h-16 rounded-md flex-shrink-0 bg-gray-200 p-1" style={{backgroundImage: 'repeating-conic-gradient(#E5E7EB 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' }}>
                                    <img src={result.outputImage} alt={result.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-grow">
                                  <p className="font-semibold text-text truncate">{result.name}</p>
                                  <p className="text-xs text-muted">{new Date(result.timestamp).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => handleDeleteResult(result.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoadResult(result)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved signatures yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};