import React, { useState, useEffect } from 'react';
import { generateFuturePrediction } from '../services/geminiService';
import { FuturePredictionResult } from '../types';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';

// Icons
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;


interface SavedPrediction {
  id: string;
  timestamp: number;
  topic: string;
  timeframe: string;
  prediction: string;
  sources?: { web: { uri: string; title: string } }[];
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

interface FuturePredictorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const FuturePredictor: React.FC<FuturePredictorProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [topic, setTopic] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('in the next 5 years');
  const [result, setResult] = useState<Omit<FuturePredictionResult, 'id' | 'timestamp' | 'topic' | 'timeframe'> | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [savedItems, setSavedItems] = useState<SavedPrediction[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load/Save hooks
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedFuturePredictions');
      if (stored) setSavedItems(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedFuturePredictions', JSON.stringify(savedItems));
    }
  }, [savedItems, isInitialLoad]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!topic || !timeframe) {
      setError('Please provide a topic and a timeframe.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setCurrentItemId(null);
    try {
      const { prediction, sources } = await generateFuturePrediction(topic, timeframe);
      setResult({ prediction, sources });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleGenerate();
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (result) {
      const newSave: SavedPrediction = {
        id: currentItemId || Date.now().toString(),
        timestamp: Date.now(),
        topic,
        timeframe,
        ...result,
      };
      if (currentItemId) {
        setSavedItems(p => p.map(item => item.id === currentItemId ? newSave : item));
      } else {
        setSavedItems([newSave, ...savedItems]);
        setCurrentItemId(newSave.id);
      }
    }
  };

  const handleLoad = (item: SavedPrediction) => {
    setTopic(item.topic);
    setTimeframe(item.timeframe);
    setResult({ prediction: item.prediction, sources: item.sources });
    setCurrentItemId(item.id);
    setShowHistory(false);
    document.getElementById('predictor-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setSavedItems(p => p.filter(item => item.id !== id));
  };
  
  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Prediction for ${topic} ${timeframe}:\n\n${result.prediction}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const textToDownload = `Future Prediction\n-----------------\n\nTopic: ${topic}\nTimeframe: ${timeframe}\n\n${result.prediction}`;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `future_prediction_${topic.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
        title: "Data-Driven Foresight",
        description: "Leverage Google Search to analyze current trends and data, providing predictions that are grounded in reality."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 13v-6" /></svg>,
        title: "Strategic Planning",
        description: "Anticipate shifts in technology, aesthetics, and user behavior to make smarter, more informed design decisions."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        title: "Inspiration Engine",
        description: "Spark new ideas by exploring what's next. Use future predictions as a launchpad for innovative and forward-thinking creative projects."
      },
  ];

  const testimonials = [
      {
        quote: "The Future Predictor is my secret weapon for client pitches. I can generate a data-backed vision of the future that positions my strategic recommendations as forward-thinking and essential.",
        name: "Aisha Khan",
        title: "Design Strategist"
      },
      {
        quote: "Staying ahead of the curve is critical. This tool helps my team anticipate what's next and ensures our work is not just current, but future-proof. It's become a key part of our planning process.",
        name: "Ben Carter",
        title: "Creative Director"
      },
  ];

   const faqs = [
      {
        q: "How accurate are the predictions?",
        a: "The predictions are generated by an AI analyzing real-time data from Google Search. While they are based on current trends and should be considered speculative, they provide a well-reasoned and plausible outlook on the future."
      },
      {
        q: "What kind of topics work best?",
        a: "The tool works well with topics related to technology, design trends, user behavior, and industry changes. For example, 'The future of virtual reality in e-commerce' or 'Minimalism in UI design'."
      },
      {
        q: "Where does the information come from?",
        a: "The AI uses Google Search to find and synthesize information from a wide range of current sources. For transparency, links to the web sources used are provided with each prediction."
      },
  ];

  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              See Tomorrow's Designs, <span className="text-primary">Today</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
              Stay ahead of the curve. Ask about any topic and get an AI-powered, data-driven prediction on the future of design, technology, and creativity.
            </p>
             <button onClick={() => document.getElementById('predictor-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Predict the Future
            </button>
          </div>
        </section>

        {/* The Tool Section */}
        <section id="predictor-tool" className="py-16 bg-surface px-4">
          <div className="container mx-auto max-w-4xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Future Predictor</h2>
              <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                  <HistoryIcon /> History
              </button>
            </div>
            
            <div className="w-full max-w-2xl flex flex-col gap-4 mb-6">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Topic (e.g., 'AI in graphic design')"
                className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
               <input
                type="text"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Timeframe (e.g., 'in the next 5 years')"
                className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed mb-8"
              >
                {loading ? 'Predicting...' : 'Predict Future'}
            </button>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            {loading && <Spinner />}

            {result && (
              <div className="w-full max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text">Prediction for "{topic}"</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopy} title="Copy" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><ClipboardCopyIcon /></button>
                      <button onClick={handleDownload} title="Download .txt" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                      <button onClick={handleSave} disabled={!isAuthenticated || !!savedItems.find(p => p.id === currentItemId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                          <SaveIcon/> {!!savedItems.find(p => p.id === currentItemId) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                  {copySuccess && <p className="text-green-600 text-center mb-2">Copied to clipboard!</p>}
                 <Card>
                    <p className="text-muted whitespace-pre-wrap">{result.prediction}</p>
                    {result.sources && result.sources.length > 0 && (
                        <div className="border-t border-border pt-4 mt-4">
                            <h4 className="font-semibold text-text mb-2">Sources:</h4>
                            <ul className="space-y-2">
                                {result.sources.map((source, index) => (
                                    <li key={index} className="text-sm">
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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
             <h2 className="text-3xl font-bold mb-10">The Strategist's Secret Weapon</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Design for the Future?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop reacting to trends. Start creating them. Get your first AI-powered prediction now.</p>
                <button onClick={() => document.getElementById('predictor-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Generate Your First Prediction
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
                                <p className="font-semibold text-text truncate">{item.topic}</p>
                                <p className="text-xs text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                              </div>
                              <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><TrashIcon /></button>
                            </div>
                            <button onClick={() => handleLoad(item)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 text-sm">Load</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted mt-8">No saved predictions yet.</p>
            )}
        </div>
    </div>
    {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};