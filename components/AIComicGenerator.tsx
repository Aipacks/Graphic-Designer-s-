import React, { useState, useEffect } from 'react';
import { generateAIComic, generateAIComicStory } from '../services/geminiService';
import { AIComicResult, User, View } from '../types';
import { Spinner } from './common/Spinner';

// SVG Icon Components
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const presets: Record<string, { style: string; layout: string; bubbleShape: string; fontSize: string; }> = {
  'Default': { style: 'American (Modern)', layout: 'Auto panel layout', bubbleShape: 'Round', fontSize: 'Medium' },
  'Classic Comic': { style: 'American (1950s)', layout: '6-panel grid', bubbleShape: 'Round with tails', fontSize: 'Medium' },
  'Manga': { style: 'Japanese Manga', layout: 'Dynamic 3-panel layout', bubbleShape: 'Spiky for emphasis', fontSize: 'Medium' },
  'Noir': { style: 'Gritty Noir', layout: 'Cinematic wide panels', bubbleShape: 'Rectangular captions', fontSize: 'Small' },
  'Cartoon': { style: 'Modern Cartoon', layout: 'Simple 2x2 grid', bubbleShape: 'Cloud-like', fontSize: 'Large' },
  '3D Render': { style: 'Cinematic 3D Render', layout: 'Widescreen panels', bubbleShape: 'Sleek transparent boxes', fontSize: 'Medium' },
  'Franco-Belgian': { style: 'Franco-Belgian "Ligne claire"', layout: 'Uniform 4x3 grid', bubbleShape: 'Rectangular', fontSize: 'Medium' },
  'Nihonga': { style: 'Japanese Nihonga Painting', layout: 'Artistic flowing panels', bubbleShape: 'Vertical rectangular boxes', fontSize: 'Small' },
  'Medieval': { style: 'Medieval Illuminated Manuscript', layout: 'Single panel with scenes', bubbleShape: 'Scroll-like banners', fontSize: 'Small' },
  'Egyptian': { style: 'Ancient Egyptian Hieroglyphs', layout: 'Horizontal frieze panels', bubbleShape: 'Integrated into art', fontSize: 'Small' },
  'Photonovel': { style: 'Vintage Photonovela', layout: '4-panel grid', bubbleShape: 'Rectangular captions', fontSize: 'Medium' },
};

const styles = [
  'American (Modern)',
  'American (1950s)',
  'Japanese Manga',
  'Japanese Nihonga Painting',
  'Franco-Belgian "Ligne claire"',
  'Gritty Noir',
  'Modern Cartoon',
  'Cinematic 3D Render',
  'Art Nouveau (Klimt)',
  'Medieval Illuminated Manuscript',
  'Ancient Egyptian Hieroglyphs',
  'Vintage Photonovela',
  'Stock Photo Collage',
  'Randomized Style',
  'Neutral Line Art'
];
const layouts = ['Auto panel layout', '4-panel grid', '6-panel grid', 'Dynamic 3-panel layout', 'Cinematic wide panels', 'Simple 2x2 grid', 'Widescreen panels', 'Uniform 4x3 grid', 'Artistic flowing panels', 'Single panel with scenes', 'Horizontal frieze panels'];
const bubbleShapes = ['Round', 'Round with tails', 'Spiky for emphasis', 'Rectangular captions', 'Cloud-like', 'Sleek transparent boxes', 'Rectangular', 'Vertical rectangular boxes', 'Scroll-like banners', 'Integrated into art', 'None'];
const fontSizes = ['Small', 'Medium', 'Large'];

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

interface AIComicGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const AIComicGenerator: React.FC<AIComicGeneratorProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [story, setStory] = useState<string>('');
  const [storyIdea, setStoryIdea] = useState<string>('');
  const [storyLoading, setStoryLoading] = useState<boolean>(false);
  const [preset, setPreset] = useState<string>('Default');
  const [style, setStyle] = useState<string>(presets['Default'].style);
  const [layout, setLayout] = useState<string>(presets['Default'].layout);
  const [bubbleShape, setBubbleShape] = useState<string>(presets['Default'].bubbleShape);
  const [fontSize, setFontSize] = useState<string>(presets['Default'].fontSize);
  
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<AIComicResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load/Save from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedAIComics');
      if (stored) setSavedResults(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedAIComics', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);

  // Handle preset changes
  useEffect(() => {
    if (presets[preset]) {
      const { style, layout, bubbleShape, fontSize } = presets[preset];
      setStyle(style);
      setLayout(layout);
      setBubbleShape(bubbleShape);
      setFontSize(fontSize);
    }
  }, [preset]);

  const handleGenerateStory = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!storyIdea) {
      setError('Please provide a story idea.');
      return;
    }
    setError(null);
    setStoryLoading(true);
    try {
      const generatedStory = await generateAIComicStory(storyIdea);
      setStory(generatedStory);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setStoryLoading(false);
    }
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
    if (!story) {
      setError('Please provide a story for your comic.');
      return;
    }
    setError(null);
    setLoading(true);
    setOutputImage(null);
    setCurrentResultId(null);
    try {
      const generatedImage = await generateAIComic(story, style, layout, bubbleShape, fontSize);
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
    if (outputImage) {
      const newResult: AIComicResult = {
        id: currentResultId || Date.now().toString(),
        timestamp: Date.now(),
        story, preset, style, layout, bubbleShape, fontSize, outputImage,
      };
      if (savedResults.some(r => r.id === currentResultId)) return;
      setSavedResults([newResult, ...savedResults]);
      setCurrentResultId(newResult.id);
    }
  };

  const handleLoadResult = (result: AIComicResult) => {
    setStory(result.story);
    setPreset(result.preset);
    setStyle(result.style);
    setLayout(result.layout);
    setBubbleShape(result.bubbleShape);
    setFontSize(result.fontSize);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setShowHistory(false);
    document.getElementById('comic-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    const safePrompt = story.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `ai_comic_${safePrompt}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        title: "AI Story Writer",
        description: "Have an idea but not a full script? Generate a complete 3-panel comic script from a single sentence."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
        title: "Diverse Art Styles",
        description: "Choose from a huge library of styles, including classic American comics, Japanese Manga, 3D renders, Noir, and more."
      },
       {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        title: "Full Customization",
        description: "You're the director. Customize panel layouts, speech bubble shapes, and text to perfectly match your creative vision."
      },
  ];

  const testimonials = [
      {
        quote: "I'm a writer, not an artist. This tool allows me to finally visualize the scenes in my head and share them with my readers. The AI story generator is surprisingly creative!",
        name: "Liam Carter",
        title: "Author"
      },
      {
        quote: "We use the AI Comic Generator to create fun, engaging content for our social media channels. It's fast, easy, and the results look incredibly professional.",
        name: "Sophia Rodriguez",
        title: "Social Media Manager"
      },
  ];

   const faqs = [
      {
        q: "How does the AI create a comic from my story?",
        a: "The AI model interprets your panel-by-panel descriptions, understanding the characters, actions, and settings. It then uses the style, layout, and other parameters you've selected to generate a single, cohesive image that looks like a complete comic page."
      },
      {
        q: "What's the best way to write the story prompt?",
        a: "Be as descriptive as possible for each panel. Include details about the camera angle (e.g., 'close up', 'wide shot'), character emotions ('a determined look'), and dialogue. The format 'Panel 1: [Description]. Character Name: \"Dialogue.\"' works well."
      },
      {
        q: "Can I create multi-page comics or use my own characters?",
        a: "Currently, the tool generates one page at a time. For multi-page stories, you can generate each page individually. To use your own characters, we recommend our 'Custom Character Creator' tool first, then describe them in detail within your comic script."
      },
  ];

  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              Turn Your Stories into <span className="text-primary">Comic Books</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
             From a simple idea to a fully illustrated comic page. Describe your story, choose a style, and let our AI be your artist.
            </p>
             <button onClick={() => document.getElementById('comic-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Create Your First Comic
            </button>
          </div>
        </section>

        {/* The Tool Section */}
        <section id="comic-tool" className="py-16 bg-surface px-4">
            <div className="container mx-auto max-w-5xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold">Comic Generator</h2>
                    <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                        <HistoryIcon /> My Comics
                    </button>
                </div>
                
                <div className="w-full flex flex-col gap-4 mb-6">
                <div className="bg-background p-4 rounded-lg border border-border">
                    <label className="block text-sm font-medium text-muted mb-2">Don't have a story? Get one from an idea!</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={storyIdea}
                            onChange={(e) => setStoryIdea(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateStory()}
                            placeholder="e.g., A cat detective solves a mystery"
                            className="flex-grow bg-surface border-2 border-border rounded-lg p-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button onClick={handleGenerateStory} disabled={storyLoading} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                            {storyLoading ? 'Writing...' : 'Write'}
                        </button>
                    </div>
                </div>
                <textarea
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Describe your comic story here, panel by panel. Be descriptive! E.g., 'Panel 1: A majestic castle at sunset. A knight approaches on horseback. Knight (V.O.): It has been a long journey... Panel 2: Close up on the knight's determined face as he looks at the castle...'"
                    rows={5}
                    className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Preset</label>
                        <select value={preset} onChange={e => setPreset(e.target.value)} className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                            {Object.keys(presets).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Art Style</label>
                        <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                            {[...new Set(styles)].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Panel Layout</label>
                        <select value={layout} onChange={e => setLayout(e.target.value)} className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                            {[...new Set(layouts)].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Bubble Shape</label>
                        <select value={bubbleShape} onChange={e => setBubbleShape(e.target.value)} className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                            {[...new Set(bubbleShapes)].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Speech Font Size</label>
                        <select value={fontSize} onChange={e => setFontSize(e.target.value)} className="w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                            {fontSizes.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                </div>
                </div>

                <div className="flex gap-2 mb-4">
                <button onClick={handleGenerate} disabled={loading || !story} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {loading ? 'Generating...' : 'Generate Comic'}
                </button>
                </div>
                 {currentUser?.plan === 'Starter' && <p className="text-sm text-muted mb-8">This will cost 1 credit. You have {currentUser.credits} credits remaining.</p>}

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {(loading || storyLoading) && <Spinner />}

                {outputImage && !loading && (
                <div className="w-full max-w-xl">
                    <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text">Your Comic</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadImage} title="Download Image" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                        <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                        </button>
                    </div>
                    </div>
                    <img src={outputImage} alt="Generated AI Comic" className="w-full h-auto rounded-xl shadow-lg border border-border" />
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
             <h2 className="text-3xl font-bold mb-10">Why Storytellers Love This Tool</h2>
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
                <h2 className="text-3xl font-bold mb-4">Your Story Deserves to be Seen</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop just writing your stories. Start showing them. Create your first comic page now.</p>
                <button onClick={() => document.getElementById('comic-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Start Your Comic
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
                                <img src={result.outputImage} alt={result.story} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                  <p className="font-semibold text-text truncate">{result.story}</p>
                                  <p className="text-xs text-muted">{new Date(result.timestamp).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => handleDeleteResult(result.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoadResult(result)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved comics yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};