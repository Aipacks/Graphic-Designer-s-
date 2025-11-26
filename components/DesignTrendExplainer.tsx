import React, { useState } from 'react';
import { generateDesignTrendExplanation } from '../services/geminiService';
import { DesignTrend } from '../types';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';

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

interface DesignTrendExplainerProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const DesignTrendExplainer: React.FC<DesignTrendExplainerProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [trendName, setTrendName] = useState<string>('');
  const [trend, setTrend] = useState<DesignTrend | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!trendName) {
      setError('Please provide a design trend name.');
      return;
    }
    setError(null);
    setLoading(true);
    setTrend(null);
    try {
      const result = await generateDesignTrendExplanation(trendName);
      setTrend(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleGenerate();
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
        title: "Powered by Google Search",
        description: "Get the most up-to-date information. Our AI uses Google Search to explain even the newest and most niche design trends."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        title: "Clear & Concise Explanations",
        description: "No jargon. Get simple, easy-to-understand explanations of what each trend is, its history, and why it's relevant today."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        title: "Actionable Characteristics",
        description: "Understand the key visual traits of each trend, giving you a clear guide on how to apply it to your own work."
      },
  ];

  const testimonials = [
      {
        quote: "This is my go-to for staying current. I hear about a new trend on social media, and I can come here and get a reliable, comprehensive explanation in seconds. It's essential.",
        name: "Aisha Khan",
        title: "Senior Product Designer"
      },
      {
        quote: "As a design student, this tool is an incredible learning resource. It helps me understand the 'why' behind different design trends and build my visual vocabulary.",
        name: "Ben Carter",
        title: "Design Student"
      },
  ];

   const faqs = [
      {
        q: "How does this tool get its information?",
        a: "Our AI uses Google Search in real-time to find and synthesize information from a wide range of sources, including design blogs, articles, and case studies. This ensures the explanations are always current."
      },
      {
        q: "Will you provide links to the sources?",
        a: "Yes! At the bottom of each explanation, we provide a list of the web sources the AI used to generate the answer, so you can dive deeper into the topic."
      },
      {
        q: "What kind of trends can I ask about?",
        a: "You can ask about almost anything! From broad movements like 'Bauhaus' to modern micro-trends like 'Claymorphism' or technology trends like 'AI in UX design'."
      },
  ];

  return (
    <>
    <div className="animate-fade-in -m-6 md:-m-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
            Stay Ahead of the <span className="text-primary">Design Curve</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
            Never fall behind. Get instant, up-to-date explanations on any design trend, from Glassmorphism to Neobrutalism, powered by the latest information from Google Search.
          </p>
            <button onClick={() => document.getElementById('trend-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
              Explain a Trend
          </button>
        </div>
      </section>

      {/* The Tool Section */}
      <section id="trend-tool" className="py-16 bg-surface px-4">
        <div className="container mx-auto max-w-4xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">Design Trend Explainer</h2>
          </div>
          <p className="text-center mb-6 text-muted max-w-2xl">Enter the name of a design trend to get a detailed explanation, key characteristics, and sources.</p>
          
          <div className="w-full max-w-xl flex gap-2 mb-8">
            <input
              type="text"
              value={trendName}
              onChange={(e) => setTrendName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 'Glassmorphism', 'Neobrutalism'"
              className="flex-grow bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? '...' : 'Explain'}
              </button>
            </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading && <Spinner />}

          {trend && (
            <div className="w-full max-w-3xl">
              <Card>
                <h3 className="text-3xl font-bold mb-2 text-primary">{trend.name}</h3>
                <p className="text-muted mb-4">{trend.explanation}</p>
                <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-text mb-2">Key Characteristics:</h4>
                    <ul className="space-y-2">
                        {trend.characteristics.map((cue, index) => (
                            <li key={index} className="text-muted flex items-start">
                                <span className="mr-2 mt-1 text-secondary">&#9679;</span>
                                {cue}
                            </li>
                        ))}
                    </ul>
                </div>
                {trend.sources && trend.sources.length > 0 && (
                    <div className="border-t border-border pt-4 mt-4">
                        <h4 className="font-semibold text-text mb-2">Sources:</h4>
                        <ul className="space-y-2">
                            {trend.sources.map((source, index) => (
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
            <h2 className="text-3xl font-bold mb-10">The Designer's Pocket Dictionary</h2>
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
              <h2 className="text-3xl font-bold mb-4">Ready to Become a Trend Expert?</h2>
              <p className="text-muted max-w-xl mx-auto mb-8">Stop wondering and start understanding. Get a clear explanation of any design trend now.</p>
              <button onClick={() => document.getElementById('trend-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                  Explain a Trend
              </button>
          </div>
      </section>
    </div>
    </>
  );
};