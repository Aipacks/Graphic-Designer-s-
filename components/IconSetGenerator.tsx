import React, { useState, useEffect } from 'react';
import { generateIconSetIdeas } from '../services/geminiService';
import { IconIdea } from '../types';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';

// Icons
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface SavedIconIdeas {
  id: string;
  timestamp: number;
  style: string;
  icons: string;
  ideas: IconIdea[];
}

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

interface IconSetGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const IconSetGenerator: React.FC<IconSetGeneratorProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [style, setStyle] = useState<string>('');
  const [icons, setIcons] = useState<string>('');
  const [ideas, setIdeas] = useState<IconIdea[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [savedItems, setSavedItems] = useState<SavedIconIdeas[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedIconIdeas');
      if (stored) setSavedItems(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedIconIdeas', JSON.stringify(savedItems));
    }
  }, [savedItems, isInitialLoad]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!style || !icons) {
      setError('Please provide both a style description and a list of icons.');
      return;
    }
    setError(null);
    setLoading(true);
    setIdeas([]);
    setCurrentItemId(null);
    try {
      const result = await generateIconSetIdeas(style, icons);
      setIdeas(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (ideas.length > 0) {
      const newSave: SavedIconIdeas = {
        id: currentItemId || Date.now().toString(),
        timestamp: Date.now(),
        style,
        icons,
        ideas,
      };
      if (currentItemId) {
        setSavedItems(p => p.map(item => item.id === currentItemId ? newSave : item));
      } else {
        setSavedItems([newSave, ...savedItems]);
        setCurrentItemId(newSave.id);
      }
    }
  };

  const handleLoad = (item: SavedIconIdeas) => {
    setStyle(item.style);
    setIcons(item.icons);
    setIdeas(item.ideas);
    setCurrentItemId(item.id);
    setShowHistory(false);
    document.getElementById('icon-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setSavedItems(p => p.filter(item => item.id !== id));
  };
  
  const handleCopy = () => {
    const textToCopy = ideas.map(idea => `${idea.concept}:\n${idea.description}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = ideas.map(idea => `# ${idea.concept}\n\n${idea.description}`).join('\n\n---\n\n');
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon_set_ideas_${style.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
        title: "Consistent Styling",
        description: "Define a style once, and get detailed visual descriptions for every icon in your list, ensuring a cohesive and professional set."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        title: "Creative Art Direction",
        description: "Go beyond simple icons. Our AI provides creative concepts and metaphors for each icon, helping you create a more meaningful user experience."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        title: "Speed Up Your Workflow",
        description: "Quickly generate a complete design brief for your icon set that you can use as a guide or hand off to another designer."
      },
  ];

  const testimonials = [
      {
        quote: "I used to spend hours sketching icon ideas. Now, I can generate a full set of creative, consistent concepts in minutes. It's an essential part of my UI design process.",
        name: "Elena Rodriguez",
        title: "UI/UX Designer"
      },
      {
        quote: "This is brilliant for brainstorming with clients. We can quickly explore different styles and metaphors for their icon set and get on the same page visually from the start.",
        name: "Marcus Wong",
        title: "Design Lead"
      },
  ];

   const faqs = [
      {
        q: "What kind of 'style' should I describe?",
        a: "Be as specific as you can. Mention things like 'single-line' or 'filled', 'rounded corners' or 'sharp edges', and use stylistic words like 'minimalist', 'playful', 'corporate', or 'brutalist'."
      },
      {
        q: "How should I list the icons?",
        a: "A simple, comma-separated list works best. For example: 'Home, Profile, Settings, Notifications, Logout'."
      },
      {
        q: "Can I generate actual icon images with this tool?",
        a: "This tool is for generating ideas and creative direction. To create the actual icons, you can use the detailed descriptions as prompts in our Vector Style Image Generator."
      },
  ];


  return (
    <>
    <div className="animate-fade-in -m-6 md:-m-8">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              Brainstorm a Cohesive <span className="text-primary">Icon Set</span> in Seconds.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
             Define your style, list the icons you need, and get a complete set of creative concepts with detailed visual descriptions.
            </p>
             <button onClick={() => document.getElementById('icon-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Start Designing
            </button>
          </div>
        </section>

        {/* The Tool Section */}
        <section id="icon-tool" className="py-16 bg-surface px-4">
          <div className="container mx-auto max-w-4xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Icon Set Idea Generator</h2>
              <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                  <HistoryIcon /> History
              </button>
            </div>
            
            <div className="w-full max-w-2xl flex flex-col gap-4 mb-6">
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Style (e.g., 'Minimalist single-line icons with rounded corners')"
                className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                value={icons}
                onChange={(e) => setIcons(e.target.value)}
                placeholder="Comma-separated list of icons (e.g., 'Profile, Settings, Home, Cart, Logout')"
                rows={3}
                className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed mb-8"
              >
                {loading ? 'Generating...' : 'Generate Ideas'}
              </button>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            {loading && <Spinner />}

            {ideas.length > 0 && (
              <div className="w-full max-w-4xl">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text">Generated Ideas</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopy} title="Copy All" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><ClipboardCopyIcon /></button>
                      <button onClick={handleDownload} title="Download .txt" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                      <button onClick={handleSave} disabled={!isAuthenticated || !!savedItems.find(p => p.id === currentItemId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                          <SaveIcon/> {!!savedItems.find(p => p.id === currentItemId) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                  {copySuccess && <p className="text-green-600 text-center mb-2">Copied to clipboard!</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ideas.map((idea, index) => (
                    <Card key={index}>
                      <h3 className="text-xl font-bold mb-2 text-primary">{idea.concept}</h3>
                      <p className="text-muted">{idea.description}</p>
                    </Card>
                  ))}
                </div>
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
             <h2 className="text-3xl font-bold mb-10">The Ultimate Icon Design Assistant</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Build Your Perfect Icon Set?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop sketching aimlessly. Get a clear, creative direction for your icons in seconds.</p>
                <button onClick={() => document.getElementById('icon-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Generate My Icon Concepts
                </button>
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
            {savedItems.length > 0 ? (
                <ul className="space-y-4">
                    {savedItems.map(item => (
                        <li key={item.id} className="bg-background border border-border p-3 rounded-lg group">
                            <div className="flex items-start gap-3">
                              <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-text truncate">{item.style}</p>
                                <p className="text-xs text-muted truncate">{item.icons}</p>
                              </div>
                              <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><TrashIcon /></button>
                            </div>
                            <button onClick={() => handleLoad(item)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 text-sm">Load</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted mt-8">No saved icon ideas yet.</p>
            )}
        </div>
    </div>
    {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};