import React, { useState, useEffect } from 'react';
import { generateMoodBoardImages } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { MoodBoard, User, View } from '../types';

// SVG Icon Components
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const PreviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;

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

interface MoodBoardGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const MoodBoardGenerator: React.FC<MoodBoardGeneratorProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedMoodBoards, setSavedMoodBoards] = useState<MoodBoard[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedBoards = localStorage.getItem('savedMoodBoards');
      if (storedBoards) {
        setSavedMoodBoards(JSON.parse(storedBoards));
      }
    } catch (e) {
      console.error("Failed to parse saved mood boards from localStorage", e);
    }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever savedMoodBoards changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedMoodBoards', JSON.stringify(savedMoodBoards));
    }
  }, [savedMoodBoards, isInitialLoad]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    
    const creditsNeeded = 4;
    if (currentUser?.plan === 'Starter' && (currentUser.credits === undefined || currentUser.credits < creditsNeeded)) {
        setError(`You need ${creditsNeeded} credits to generate a mood board. Please upgrade to Pro for unlimited generations.`);
        return;
    }

    if (!prompt) {
      setError('Please enter a theme or concept.');
      return;
    }
    setError(null);
    setLoading(true);
    setImages([]);
    setCurrentBoardId(null);
    try {
      const generatedImages = await generateMoodBoardImages(prompt);
      setImages(generatedImages);
      if (currentUser?.plan === 'Starter') {
          onDeductCredits(creditsNeeded);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleGenerate();
  };

  const handleSaveBoard = () => {
    if (images.length > 0 && prompt) {
      if (savedMoodBoards.some(b => b.id === currentBoardId)) return;
      
      const newBoard: MoodBoard = {
        id: currentBoardId || Date.now().toString(),
        prompt,
        images,
        timestamp: Date.now(),
      };
      
      if (currentBoardId) {
        setSavedMoodBoards(boards => boards.map(b => b.id === currentBoardId ? newBoard : b));
      } else {
        setSavedMoodBoards([newBoard, ...savedMoodBoards]);
        setCurrentBoardId(newBoard.id);
      }
    }
  };

  const handleLoadBoard = (board: MoodBoard) => {
    setPrompt(board.prompt);
    setImages(board.images);
    setCurrentBoardId(board.id);
    setShowHistory(false);
  };

  const handleDeleteBoard = (boardId: string) => {
    setSavedMoodBoards(boards => boards.filter(b => b.id !== boardId));
  };

  const handleDownloadImage = (imgSrc: string, index: number) => {
    const link = document.createElement('a');
    link.href = imgSrc;
    const safePrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `moodboard_${safePrompt}_${index + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const examples = [
    {
      prompt: "Art Deco Luxury Hotel",
      colors: ['#0a0a0a', '#c5a47e', '#e0e0e0', '#343434']
    },
    {
      prompt: "Serene Autumn Forest",
      colors: ['#a84e22', '#5a3825', '#e4dcd3', '#6e7f62']
    },
    {
      prompt: "Cyberpunk City at Night",
      colors: ['#ff00ff', '#00ffff', '#39ff14', '#0d0221']
    }
  ];

  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        title: "AI-Powered Inspiration",
        description: "Just type a concept, and our advanced AI generates a unique, professional mood board in seconds, saving you hours of manual searching."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        title: "High-Quality Visuals",
        description: "Receive four distinct, high-resolution images for every mood board, perfect for presentations, client pitches, and personal projects."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        title: "Save & Organize",
        description: "Keep track of all your creative explorations with our built-in history panel. Save your favorite mood boards to revisit and refine them later."
      },
  ];

  const testimonials = [
      {
        quote: "The Mood Board Generator has become an indispensable part of my workflow. It's like having a junior designer that never sleeps!",
        name: "Jessica Chen",
        title: "Freelance Brand Strategist"
      },
      {
        quote: "I was stuck on a project, but after generating a few mood boards, the ideas started flowing. This tool is a creativity supercharger.",
        name: "Mike Rodriguez",
        title: "UI/UX Designer at TechCo"
      },
  ];

   const faqs = [
      {
        q: "How does the AI generate images?",
        a: "Our tool uses a state-of-the-art text-to-image model. When you enter a prompt, the AI analyzes the text and generates four unique images that capture the essence, style, and color palette of your concept."
      },
      {
        q: "What kind of prompts work best?",
        a: "Be descriptive! The more detail you provide, the better. Try combining styles, objects, and moods. For example, instead of 'beach', try 'a serene, minimalist beach at sunrise with pastel colors'."
      },
      {
        q: "Can I use the generated images commercially?",
        a: "Yes, you are free to use the images generated in your personal and commercial projects, according to our terms of service."
      },
      {
        q: "How are my saved mood boards stored?",
        a: "Your saved mood boards are stored securely in your browser's local storage. This means they are private to you and accessible whenever you use the same browser on your device."
      },
  ];

  const pageUrl = "https://aistudio.google.com/";
  const shareText = "Check out this amazing AI Mood Board Generator!";
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
              AI Mood Board Generator
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
              Instantly visualize your ideas. Describe any concept, style, or theme, and watch our AI craft a stunning mood board to kickstart your creative process.
            </p>
            
            <div className="w-full max-w-2xl mx-auto flex gap-2 mb-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Art Deco luxury hotel (costs 4 credits)"
                className="flex-grow bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Mood board prompt"
              />
              <button onClick={handleGenerate} disabled={loading} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {loading ? 'Generating...' : 'Generate'}
              </button>
              <button onClick={() => setShowHistory(true)} className="bg-surface text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border" aria-label="View history">
                <HistoryIcon />
              </button>
            </div>
            {currentUser?.plan === 'Starter' && <p className="text-sm text-muted mb-8">You have {currentUser.credits} credits remaining.</p>}

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <Spinner />}

            {images.length > 0 && (
              <div className="w-full animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text truncate">Result for: "{prompt}"</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopyPrompt} className="flex items-center gap-2 bg-gray-100 text-text font-bold py-2 px-4 rounded-lg transition-colors hover:bg-gray-200">
                        <ClipboardCopyIcon /> {copySuccess ? 'Copied!' : 'Copy Prompt'}
                    </button>
                    <button onClick={handleSaveBoard} disabled={!isAuthenticated || !!savedMoodBoards.find(b => b.id === currentBoardId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                      <SaveIcon/> {!!savedMoodBoards.find(b => b.id === currentBoardId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  {images.map((imgSrc, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg">
                      <img src={imgSrc} alt={`Mood board image ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedImage(imgSrc)} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70" aria-label="Preview image"><PreviewIcon /></button>
                          <button onClick={() => handleDownloadImage(imgSrc, index)} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70" aria-label="Download image"><DownloadIcon /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Examples/Gallery */}
        <section className="py-16 bg-surface px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">See What's Possible</h2>
            <p className="text-muted max-w-2xl mx-auto mb-10">From minimalist to cyberpunk, explore mood boards generated by the AI.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {examples.map((ex, i) => (
                <div key={i} className="bg-background p-4 rounded-lg border border-border shadow-sm">
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-square mb-3">
                    {ex.colors.map((color, j) => (
                       <div key={j} className="w-full h-full rounded" style={{backgroundColor: color}}></div>
                    ))}
                  </div>
                  <p className="font-semibold text-text">{ex.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Features */}
        <section className="py-16 px-4">
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
        <section className="py-16 bg-background px-4">
          <div className="container mx-auto text-center">
             <h2 className="text-3xl font-bold mb-10">Loved by Creatives</h2>
             <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               {testimonials.map((t, i) => (
                 <blockquote key={i} className="bg-surface p-8 rounded-lg border border-border shadow-sm">
                   <p className="text-lg text-text mb-4 italic">"{t.quote}"</p>
                   <footer className="font-semibold text-muted">&mdash; {t.name}, <span className="text-primary">{t.title}</span></footer>
                 </blockquote>
               ))}
             </div>
          </div>
        </section>

        {/* Section 5: FAQs */}
        <section className="py-16 px-4">
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
                <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop searching and start creating. Generate your first mood board now and bring your vision to life.</p>
                <button onClick={() => document.querySelector('input')?.focus()} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Start Generating
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
              {savedMoodBoards.length > 0 ? (
                  <ul className="space-y-4">
                      {savedMoodBoards.map(board => (
                          <li key={board.id} className="bg-background border border-border p-3 rounded-lg group">
                              <div className="flex items-start gap-3">
                                <img src={board.images[0]} alt={board.prompt} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                  <p className="font-semibold text-text truncate">{board.prompt}</p>
                                  <p className="text-xs text-muted">{new Date(board.timestamp).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => handleDeleteBoard(board.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoadBoard(board)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved mood boards yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}


      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Mood board preview" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
      )}
    </>
  );
};