import React, { useState, useEffect } from 'react';
import { generateCreativeBrief } from '../services/geminiService';
import { CreativeBriefSection } from '../types';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';

// Icons
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface SavedCreativeBrief {
  id: string;
  timestamp: number;
  project: string;
  goal: string;
  brief: CreativeBriefSection[];
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

interface CreativeBriefAssistantProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const CreativeBriefAssistant: React.FC<CreativeBriefAssistantProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [project, setProject] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [brief, setBrief] = useState<CreativeBriefSection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const [savedItems, setSavedItems] = useState<SavedCreativeBrief[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedCreativeBriefs');
      if (stored) setSavedItems(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedCreativeBriefs', JSON.stringify(savedItems));
    }
  }, [savedItems, isInitialLoad]);


  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!project || !goal) {
      setError('Please provide both a project name and a main goal.');
      return;
    }
    setError(null);
    setLoading(true);
    setBrief([]);
    setCurrentItemId(null);
    try {
      const result = await generateCreativeBrief(project, goal);
      setBrief(result);
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
    if (brief.length > 0) {
      const newSave: SavedCreativeBrief = {
        id: currentItemId || Date.now().toString(),
        timestamp: Date.now(),
        project,
        goal,
        brief,
      };
      if (currentItemId) {
        setSavedItems(p => p.map(item => item.id === currentItemId ? newSave : item));
      } else {
        setSavedItems([newSave, ...savedItems]);
        setCurrentItemId(newSave.id);
      }
    }
  };

  const handleLoad = (item: SavedCreativeBrief) => {
    setProject(item.project);
    setGoal(item.goal);
    setBrief(item.brief);
    setCurrentItemId(item.id);
    setShowHistory(false);
    document.getElementById('brief-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setSavedItems(p => p.filter(item => item.id !== id));
  };
  
  const handleCopy = () => {
    const textToCopy = brief.map(section => `${section.title}:\n${section.content}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = `Creative Brief: ${project}\n\n` + brief.map(section => `## ${section.title}\n\n${section.content}`).join('\n\n');
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative_brief_${project.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        title: "Structured for Success",
        description: "Get a professionally structured brief with essential sections like Objective, Target Audience, Key Message, and Deliverables."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        title: "Aligns Your Team",
        description: "Ensure everyone—designers, copywriters, and stakeholders—is on the same page from the start, reducing revisions and misunderstandings."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        title: "Saves Hours of Meetings",
        description: "Generate a comprehensive first draft in seconds, turning a lengthy kickoff meeting into a quick and productive review session."
      },
  ];

  const testimonials = [
      {
        quote: "The Creative Brief Assistant has become an essential part of our project kickoff process. It ensures we cover all the key points and helps us align with clients faster than ever.",
        name: "Samantha Jones",
        title: "Project Manager"
      },
      {
        quote: "As a freelancer, starting with a solid brief is crucial. This tool helps me ask the right questions and create a document that keeps my projects on track and my clients happy.",
        name: "David Kim",
        title: "Freelance Designer"
      },
  ];

   const faqs = [
      {
        q: "What is a creative brief?",
        a: "A creative brief is a foundational document for any creative project. It outlines the project's objective, target audience, key message, and deliverables to ensure everyone involved is working towards the same goal."
      },
      {
        q: "How detailed should the project goal be?",
        a: "Be as clear and concise as possible. A good goal focuses on the desired outcome. For example, 'Increase sign-ups by 20%' is better than 'Make a new landing page'."
      },
      {
        q: "Can I edit the generated brief?",
        a: "Absolutely. The generated brief is a starting point. You can copy the text and expand on each section with more specific details relevant to your project."
      },
  ];

  return (
    <>
    <div className="animate-fade-in -m-6 md:-m-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
            Start Every Project with <span className="text-primary">Perfect Clarity</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
            Stop wasting time in kickoff meetings. Generate a complete, professional creative brief from just a project name and goal, and get your team aligned in minutes.
          </p>
            <button onClick={() => document.getElementById('brief-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
              Create My First Brief
          </button>
        </div>
      </section>

      {/* The Tool Section */}
      <section id="brief-tool" className="py-16 bg-surface px-4">
        <div className="container mx-auto max-w-4xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">Creative Brief Assistant</h2>
            <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                <HistoryIcon /> History
            </button>
          </div>
          <p className="text-center mb-6 text-muted max-w-2xl">Get a head start on your project. Enter a name and goal to generate a structured creative brief.</p>
          
          <div className="w-full max-w-2xl flex flex-col gap-4 mb-6">
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Project Name (e.g., 'Website Redesign for Acme Corp')"
              className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Main Goal (e.g., 'Increase user engagement and modernize the brand image')"
              className="bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 mb-8">
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Brief'}
              </button>
            </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading && <Spinner />}

          {brief.length > 0 && (
            <div className="w-full max-w-3xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text">Generated Brief</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy} title="Copy All" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><ClipboardCopyIcon /></button>
                    <button onClick={handleDownload} title="Download .txt" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                    <button onClick={handleSave} disabled={!isAuthenticated || !!savedItems.find(p => p.id === currentItemId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                        <SaveIcon/> {!!savedItems.find(p => p.id === currentItemId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
                {copySuccess && <p className="text-green-600 text-center mb-2">Copied to clipboard!</p>}
                <div className="flex flex-col gap-4">
                  {brief.map((section, index) => (
                    <Card key={index}>
                      <h3 className="text-xl font-bold mb-2 text-primary">{section.title}</h3>
                      <p className="text-muted whitespace-pre-wrap">{section.content}</p>
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
            <h2 className="text-3xl font-bold mb-10">The Foundation for Great Work</h2>
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
              <h2 className="text-3xl font-bold mb-4">Ready to Align Your Team?</h2>
              <p className="text-muted max-w-xl mx-auto mb-8">Great projects start with great briefs. Generate yours in seconds and set your next project up for success.</p>
              <button onClick={() => document.getElementById('brief-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                  Generate My Brief
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
                                <p className="font-semibold text-text truncate">{item.project}</p>
                                <p className="text-xs text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                              </div>
                              <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><TrashIcon /></button>
                            </div>
                            <button onClick={() => handleLoad(item)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 text-sm">Load</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted mt-8">No saved briefs yet.</p>
            )}
        </div>
    </div>
    {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};