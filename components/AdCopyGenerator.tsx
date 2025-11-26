import React, { useState, useEffect } from 'react';
import { generateAdCopy } from '../services/geminiService';
import { AdCopy } from '../types';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';

// Icons
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const platforms = ['Facebook', 'Instagram', 'Google Ads', 'LinkedIn', 'Twitter (X)'];

interface SavedAdCopy {
  id: string;
  timestamp: number;
  product: string;
  audience: string;
  platform: string;
  copies: AdCopy[];
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

interface AdCopyGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const AdCopyGenerator: React.FC<AdCopyGeneratorProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [product, setProduct] = useState<string>('');
  const [audience, setAudience] = useState<string>('');
  const [platform, setPlatform] = useState<string>(platforms[0]);
  const [copies, setCopies] = useState<AdCopy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [savedItems, setSavedItems] = useState<SavedAdCopy[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedAdCopy');
      if (stored) setSavedItems(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedAdCopy', JSON.stringify(savedItems));
    }
  }, [savedItems, isInitialLoad]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!product || !audience) {
      setError('Please provide a product/service and a target audience.');
      return;
    }
    setError(null);
    setLoading(true);
    setCopies([]);
    setCurrentItemId(null);
    try {
      const result = await generateAdCopy(product, audience, platform);
      setCopies(result);
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
    if (copies.length > 0) {
      const newSave: SavedAdCopy = {
        id: currentItemId || Date.now().toString(),
        timestamp: Date.now(),
        product,
        audience,
        platform,
        copies,
      };
      if (currentItemId) {
        setSavedItems(p => p.map(item => item.id === currentItemId ? newSave : item));
      } else {
        setSavedItems([newSave, ...savedItems]);
        setCurrentItemId(newSave.id);
      }
    }
  };

  const handleLoad = (item: SavedAdCopy) => {
    setProduct(item.product);
    setAudience(item.audience);
    setPlatform(item.platform);
    setCopies(item.copies);
    setCurrentItemId(item.id);
    setShowHistory(false);
    document.getElementById('ad-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setSavedItems(p => p.filter(item => item.id !== id));
  };
  
  const handleCopy = () => {
    const textToCopy = copies.map(c => `Platform: ${c.platform}\nHeadline: ${c.headline}\nBody: ${c.body}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = copies.map(c => `Platform: ${c.platform}\n\nHeadline: ${c.headline}\n\nBody: ${c.body}`).join('\n\n---\n\n');
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad_copy_${product.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
        title: "Platform-Specific Tone",
        description: "Get copy tailored for Facebook's friendly feed, LinkedIn's professional network, or Google's search results."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>,
        title: "Multiple Variations",
        description: "Generate several ad variations in seconds to A/B test headlines and body copy for maximum performance."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        title: "Focus on Benefits",
        description: "Our AI goes beyond features to write compelling, benefit-driven copy that resonates with your audience and drives action."
      },
  ];

  const testimonials = [
      {
        quote: "This tool has cut my ad creation time in half. The copy it generates is consistently high-quality and often outperforms my own. A must-have for any marketer.",
        name: "Alex Gomez",
        title: "Digital Marketer"
      },
      {
        quote: "As a startup founder, I don't have a huge marketing budget. The Ad Copy Generator helps me create professional ads that get results without hiring an expensive copywriter.",
        name: "Sarah Chen",
        title: "Founder of Bloom Co."
      },
  ];

   const faqs = [
      {
        q: "How specific should my product description be?",
        a: "The more details you provide, the better. Include key features, benefits, and what makes your product unique."
      },
      {
        q: "Can I use this for any ad platform?",
        a: "Yes! While we have presets for major platforms, the principles of good copy apply everywhere. The generated text is a great starting point for any ad."
      },
      {
        q: "Does the AI understand different tones of voice?",
        a: "You can influence the tone by how you describe your product and audience. For a playful tone, describe your audience as 'fun-loving millennials.' For a professional tone, use 'senior-level executives'."
      },
  ];

  return (
    <>
    <div className="animate-fade-in -m-6 md:-m-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
            Write Ad Copy That <span className="text-primary">Converts</span>. Instantly.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
            Stop guessing what works. Describe your product and target audience to get high-performing ad copy for any platform.
          </p>
            <button onClick={() => document.getElementById('ad-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
              Start Writing Now
          </button>
        </div>
      </section>

      {/* The Tool Section */}
      <section id="ad-tool" className="py-16 bg-surface px-4">
        <div className="container mx-auto max-w-4xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">Ad Copy Generator</h2>
            <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                <HistoryIcon /> History
            </button>
          </div>
          <p className="text-center mb-6 text-muted max-w-2xl">Craft compelling ad copy. Describe your product, target audience, and choose a platform.</p>
          
          <div className="w-full max-w-2xl flex flex-col gap-4 mb-6">
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Product or Service (e.g., 'A premium, handcrafted leather wallet')"
              className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Target Audience (e.g., 'Style-conscious young professionals')"
              className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex gap-2 mb-8">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Ad Copy'}
              </button>
            </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading && <Spinner />}

          {copies.length > 0 && (
            <div className="w-full max-w-3xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text">Generated Copy</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy} title="Copy All" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><ClipboardCopyIcon /></button>
                    <button onClick={handleDownload} title="Download .txt" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                    <button onClick={handleSave} disabled={!isAuthenticated || !!savedItems.find(p => p.id === currentItemId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                        <SaveIcon/> {!!savedItems.find(p => p.id === currentItemId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              {copySuccess && <p className="text-green-600 text-center mb-2">Copied to clipboard!</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {copies.map((copy, index) => (
                  <Card key={index}>
                    <h3 className="text-lg font-bold mb-2 text-primary">{copy.headline}</h3>
                    <p className="text-muted whitespace-pre-wrap">{copy.body}</p>
                    <p className="text-sm text-muted mt-4 pt-2 border-t border-border">Platform: {copy.platform}</p>
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
            <h2 className="text-3xl font-bold mb-10">Trusted by High-Growth Brands</h2>
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
              <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Conversions?</h2>
              <p className="text-muted max-w-xl mx-auto mb-8">Stop the guesswork. Start writing ads that work. Generate your first high-performing ad copy now.</p>
              <button onClick={() => document.getElementById('ad-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                  Generate My Ad Copy
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
                                <p className="font-semibold text-text truncate">{item.product}</p>
                                <p className="text-xs text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                              </div>
                              <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><TrashIcon /></button>
                            </div>
                            <button onClick={() => handleLoad(item)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 text-sm">Load</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted mt-8">No saved ad copy yet.</p>
            )}
        </div>
    </div>
    {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};