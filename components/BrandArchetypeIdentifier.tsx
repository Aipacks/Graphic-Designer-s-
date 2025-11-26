import React, { useState, useEffect } from 'react';
import { identifyBrandArchetype } from '../services/geminiService';
import { BrandArchetype } from '../types';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';

// Icons
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface SavedBrandArchetype {
  id: string;
  timestamp: number;
  brandDescription: string;
  archetype: BrandArchetype;
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

interface BrandArchetypeIdentifierProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const BrandArchetypeIdentifier: React.FC<BrandArchetypeIdentifierProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [brandDescription, setBrandDescription] = useState<string>('');
  const [archetype, setArchetype] = useState<BrandArchetype | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [savedItems, setSavedItems] = useState<SavedBrandArchetype[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedBrandArchetypes');
      if (stored) setSavedItems(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedBrandArchetypes', JSON.stringify(savedItems));
    }
  }, [savedItems, isInitialLoad]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!brandDescription) {
      setError('Please provide a brand description.');
      return;
    }
    setError(null);
    setLoading(true);
    setArchetype(null);
    setCurrentItemId(null);
    try {
      const result = await identifyBrandArchetype(brandDescription);
      setArchetype(result);
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
    if (archetype) {
      const newSave: SavedBrandArchetype = {
        id: currentItemId || Date.now().toString(),
        timestamp: Date.now(),
        brandDescription,
        archetype,
      };
      if (currentItemId) {
        setSavedItems(p => p.map(item => item.id === currentItemId ? newSave : item));
      } else {
        setSavedItems([newSave, ...savedItems]);
        setCurrentItemId(newSave.id);
      }
    }
  };

  const handleLoad = (item: SavedBrandArchetype) => {
    setBrandDescription(item.brandDescription);
    setArchetype(item.archetype);
    setCurrentItemId(item.id);
    setShowHistory(false);
    document.getElementById('archetype-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setSavedItems(p => p.filter(item => item.id !== id));
  };
  
  const handleCopy = () => {
    if (!archetype) return;
    const textToCopy = `Archetype: The ${archetype.archetype}\n\nDescription: ${archetype.description}\n\nDesign Cues:\n${archetype.designCues.map(c => `- ${c}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!archetype) return;
    const textToDownload = `Brand Archetype Analysis\n-------------------------\n\nArchetype: The ${archetype.archetype}\n\nDescription:\n${archetype.description}\n\nDesign Cues:\n${archetype.designCues.map(c => `- ${c}`).join('\n')}`;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand_archetype_${archetype.archetype}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        title: "Unlock Your Brand's Personality",
        description: "Go beyond mission statements to discover the core personality of your brand, from 'The Hero' to 'The Sage'."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
        title: "Clear Design Direction",
        description: "Every archetype comes with actionable design cues for colors, typography, and imagery to guide your creative decisions."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5.5 8m7 2H5m7 2v4m0 0v2" /></svg>,
        title: "Connect With Your Audience",
        description: "By understanding your brand's archetype, you can create a more authentic and resonant connection with your target customers."
      },
  ];

  const testimonials = [
      {
        quote: "This was the breakthrough we needed. Identifying our brand as 'The Creator' gave us a clear path for our entire visual identity and marketing voice. It's a foundational tool.",
        name: "Jessica Chen",
        title: "Brand Strategist"
      },
      {
        quote: "I use this with all my new clients. It's an incredibly fast and effective way to get to the heart of their brand and align on a creative direction from day one.",
        name: "Michael Brandt",
        title: "Agency Owner"
      },
  ];

   const faqs = [
      {
        q: "What are brand archetypes?",
        a: "Brand archetypes are universal patterns of personality, based on the work of Carl Jung. They represent fundamental human motivations and help create relatable, human-like brand identities (e.g., The Hero, The Jester, The Sage)."
      },
      {
        q: "Why are archetypes important for design?",
        a: "Your brand's archetype provides a clear framework for all creative decisions. It helps ensure your logo, colors, photography, and copy are all working together to tell a consistent and compelling story."
      },
      {
        q: "What should I include in my brand description?",
        a: "Describe your company's mission, values, target audience, and the overall feeling or personality you want to convey. The more detail you provide, the more accurate the result will be."
      },
  ];

  return (
    <>
    <div className="animate-fade-in -m-6 md:-m-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
            Discover the <span className="text-primary">Soul</span> of Your Brand.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
            Go beyond mission statements. Describe your brand's values and personality to instantly identify its core archetype and get clear, actionable design direction.
          </p>
            <button onClick={() => document.getElementById('archetype-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
              Find My Archetype
          </button>
        </div>
      </section>

      {/* The Tool Section */}
      <section id="archetype-tool" className="py-16 bg-surface px-4">
        <div className="container mx-auto max-w-4xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">Brand Archetype Identifier</h2>
            <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                <HistoryIcon /> History
            </button>
          </div>
          <p className="text-center mb-6 text-muted max-w-2xl">Define your brand's soul. Describe its values and mission to uncover its archetype and get design direction.</p>
          
          <div className="w-full max-w-2xl flex flex-col gap-4 mb-6">
            <textarea
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              placeholder="Describe your brand's values, mission, and personality... (e.g., 'We are an innovative tech company that empowers users with cutting-edge tools. We value precision, knowledge, and authority.')"
              rows={5}
              className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 mb-8">
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Identify Archetype'}
              </button>
            </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading && <Spinner />}

          {archetype && (
            <div className="w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text">Identified Archetype</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy} title="Copy All" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><ClipboardCopyIcon /></button>
                    <button onClick={handleDownload} title="Download .txt" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                    <button onClick={handleSave} disabled={!isAuthenticated || !!savedItems.find(p => p.id === currentItemId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                        <SaveIcon/> {!!savedItems.find(p => p.id === currentItemId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
                {copySuccess && <p className="text-green-600 text-center mb-2">Copied to clipboard!</p>}
              <Card>
                <h3 className="text-3xl font-bold mb-2 text-primary">The {archetype.archetype}</h3>
                <p className="text-muted mb-4">{archetype.description}</p>
                <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-text mb-2">Design Cues:</h4>
                    <ul className="space-y-2">
                        {archetype.designCues.map((cue, index) => (
                            <li key={index} className="text-muted flex items-start">
                                <span className="mr-2 mt-1 text-secondary">&#9679;</span>
                                {cue}
                            </li>
                        ))}
                    </ul>
                </div>
              </Card>
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
            <h2 className="text-3xl font-bold mb-10">The Foundation of Great Brands</h2>
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
              <h2 className="text-3xl font-bold mb-4">Ready to Define Your Brand's Identity?</h2>
              <p className="text-muted max-w-xl mx-auto mb-8">Stop guessing and start building a brand with purpose. Uncover your archetype now.</p>
              <button onClick={() => document.getElementById('archetype-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                  Identify My Archetype
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
                                <p className="font-semibold text-text truncate">The {item.archetype.archetype}</p>
                                <p className="text-xs text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                              </div>
                              <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><TrashIcon /></button>
                            </div>
                            <button onClick={() => handleLoad(item)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 text-sm">Load</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted mt-8">No saved archetypes yet.</p>
            )}
        </div>
    </div>
    {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};