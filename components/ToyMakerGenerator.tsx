import React, { useState, useEffect } from 'react';
import { generateToyImage } from '../services/geminiService';
import { ToyMakerResult, User, View } from '../types';
import { Spinner } from './common/Spinner';

// SVG Icon Components
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const toyCategories = ['Collectible Vinyl', 'Action Figure', 'Anime Figure', 'Cartoon Character', 'Labubu / Art Toy', 'Designer Toy', 'Plush Toy', 'Funko Pop Style'];

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

interface ToyMakerGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const ToyMakerGenerator: React.FC<ToyMakerGeneratorProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [category, setCategory] = useState<string>(toyCategories[0]);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedResults, setSavedResults] = useState<ToyMakerResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedToyMakerResults');
      if (stored) {
        setSavedResults(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saved toy maker results from localStorage", e);
    }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever savedResults changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedToyMakerResults', JSON.stringify(savedResults));
    }
  }, [savedResults, isInitialLoad]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSourcePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSourceFile(null);
    setSourcePreview(null);
    const fileInput = document.getElementById('toy-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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

    if (!prompt) {
      setError('Please provide a description for the toy.');
      return;
    }
    setError(null);
    setLoading(true);
    setOutputImage(null);
    setCurrentResultId(null);
    try {
      const generatedImage = await generateToyImage(prompt, category, sourceFile || undefined);
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
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleGenerate();
    }
  };

  const handleSaveResult = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (outputImage) {
      const newResult: ToyMakerResult = {
        id: currentResultId || Date.now().toString(),
        prompt,
        category,
        sourceImage: sourcePreview || undefined,
        outputImage,
        timestamp: Date.now(),
      };
      
      if (savedResults.some(r => r.id === currentResultId)) return;

      setSavedResults([newResult, ...savedResults]);
      setCurrentResultId(newResult.id);
    }
  };

  const handleLoadResult = (result: ToyMakerResult) => {
    setPrompt(result.prompt);
    setCategory(result.category);
    setSourcePreview(result.sourceImage || null);
    setOutputImage(result.outputImage);
    setCurrentResultId(result.id);
    setSourceFile(null);
    setShowHistory(false);
    document.getElementById('toy-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteResult = (resultId: string) => {
    setSavedResults(results => results.filter(r => r.id !== resultId));
  };
  
  const handleDownloadImage = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    const safePrompt = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `toy_maker_${safePrompt}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const examples = [
    {
      image: "https://picsum.photos/seed/cosmic-knight/400",
      name: "Cosmic Knight",
      concept: "An astronaut knight with a glowing sword."
    },
    {
      image: "https://picsum.photos/seed/dj-octo/400",
      name: "DJ Octo",
      concept: "A friendly octopus DJ with headphones."
    },
    {
      image: "https://picsum.photos/seed/sir-reginald/400",
      name: "Sir Reginald",
      concept: "A sophisticated steampunk penguin."
    }
  ];

  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
        title: "Vibrant 3D Style",
        description: "Get beautiful, high-quality images that look like collectible vinyl toys with glossy finishes and professional studio lighting."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        title: "From Concept to Collectible",
        description: "Perfect for character designers, hobbyists, and anyone who wants to turn a creative spark into a tangible, playful visual."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
        title: "Unleash Your Imagination",
        description: "If you can dream it, you can create it. Let your imagination run wild and generate an endless supply of unique toy concepts."
      },
  ];

  const testimonials = [
      {
        quote: "This is my favorite tool for brainstorming character designs. The toy-like style is so charming and it helps me visualize my ideas in 3D space. It's incredibly fun and useful.",
        name: "Chloe Kim",
        title: "Character Designer"
      },
      {
        quote: "I use the Toy Maker to create unique avatars and profile pictures. My friends are always asking me how I make them. The results are always so cool and polished!",
        name: "Leo Martinez",
        title: "Digital Artist"
      },
  ];

   const faqs = [
      {
        q: "What kind of prompts work best?",
        a: "Be descriptive and imaginative! Combine different concepts. For example, instead of 'a robot', try 'a friendly, retro-style robot gardener made of copper'."
      },
      {
        q: "What is the style of the generated images?",
        a: "The AI is specifically prompted to create images in the style of 3D-rendered, collectible vinyl toys. This gives them a distinct, playful, and high-quality look."
      },
      {
        q: "Can I use these images in my projects?",
        a: "Yes, you are free to use the images you generate in your personal and commercial projects, according to our terms of service."
      },
  ];
  
  const pageUrl = "https://aistudio.google.com/";
  const shareText = "I just created an awesome 3D toy with this AI Toy Maker!";
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareText)}`;

  return (
    <>
    <div className="animate-fade-in -m-6 md:-m-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
            Your Personal AI <span className="text-primary">Toy Factory</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
            Bring your imagination to life. Describe any character or concept and create a unique, 3D-style toy image perfect for concept art, avatars, or just for fun.
          </p>
            <button onClick={() => document.getElementById('toy-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
              Make Your First Toy
          </button>
        </div>
      </section>

      {/* The Tool Section */}
      <section id="toy-tool" className="py-16 bg-surface px-4">
        <div className="container mx-auto max-w-5xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Toy Maker</h2>
                <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                    <HistoryIcon /> My Toys
                </button>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 p-6 border border-border rounded-lg bg-background">
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-lg">1. Describe your toy</h3>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., 'A cute, futuristic robot holding a flower'"
                        rows={4}
                        className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Category</label>
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {toyCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-lg">2. Add reference (optional)</h3>
                    <div className="bg-surface border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center min-h-[150px] h-full">
                        {sourcePreview ? (
                            <div className="relative">
                                <img src={sourcePreview} alt="Reference preview" className="max-h-32 w-auto rounded-md"/>
                                <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">&times;</button>
                            </div>
                        ) : (
                            <p className="text-muted text-center text-sm">Upload an image for style or character inspiration.</p>
                        )}
                    </div>
                    <label htmlFor="toy-image-upload" className="cursor-pointer bg-gray-100 text-text font-bold py-2 px-4 rounded-lg text-center transition-colors hover:bg-gray-200">
                        {sourceFile ? 'Change Image' : 'Upload Image'}
                    </label>
                    <input id="toy-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
                <button onClick={handleGenerate} disabled={loading || !prompt} className="bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {loading ? 'Making...' : 'Make Toy'}
                </button>
                {currentUser?.plan === 'Starter' && <p className="text-sm text-muted">Cost: 1 credit. You have {currentUser.credits} left.</p>}
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <Spinner />}
            
            {outputImage && (
                <div className="w-full animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {sourcePreview && (
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold text-text mb-2">Reference</h3>
                                <div className="relative w-full aspect-square bg-background border border-border rounded-lg p-2 flex items-center justify-center">
                                    <img src={sourcePreview} alt="Source preview" className="max-h-full max-w-full object-contain rounded-md"/>
                                </div>
                            </div>
                        )}
                         <div className={`flex flex-col items-center ${!sourcePreview ? 'md:col-start-1 md:col-span-2 max-w-lg mx-auto' : ''}`}>
                            <div className="w-full flex justify-between items-center mb-2">
                               <h3 className="text-lg font-semibold text-text">Your Toy</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleDownloadImage} title="Download Image" className="flex items-center gap-2 bg-gray-100 text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-200"><DownloadIcon /></button>
                                    <button onClick={handleSaveResult} disabled={!isAuthenticated || !!savedResults.find(b => b.id === currentResultId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                    <SaveIcon/> {!!savedResults.find(b => b.id === currentResultId) ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                            </div>
                            <div className="relative w-full aspect-square bg-background border border-border rounded-lg p-2 flex items-center justify-center">
                                <img src={outputImage} alt="Generated toy" className="max-h-full max-w-full object-contain rounded-md shadow-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </section>

       {/* Gallery Section */}
      <section className="py-16 bg-background px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">The AI Toy Box</h2>
          <p className="text-muted max-w-2xl mx-auto mb-10">See what others have created with the Toy Maker.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examples.map((ex, i) => (
              <div key={i} className="bg-surface p-4 rounded-lg border border-border shadow-sm group">
                <div className="overflow-hidden rounded-md mb-4">
                    <img src={ex.image} alt={ex.name} className="w-full h-auto aspect-square object-cover group-hover:scale-105 transition-transform duration-300"/>
                </div>
                <h3 className="font-bold text-xl text-text">{ex.name}</h3>
                <p className="text-muted text-sm">{ex.concept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-surface">
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
      <section className="py-16 bg-background px-4">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10">Loved by Creators & Dreamers</h2>
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

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-surface">
          <div className="container mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
              <div>
                  {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
              </div>
          </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 text-center bg-background px-4">
          <div className="container mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Your Dream Toy?</h2>
              <p className="text-muted max-w-xl mx-auto mb-8">Stop dreaming and start creating. Generate your first unique toy design now.</p>
              <button onClick={() => document.getElementById('toy-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                  Make My Toy
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
            <h3 className="text-xl font-bold text-text">My Toys</h3>
            <button onClick={() => setShowHistory(false)} className="text-text font-bold text-2xl">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
            {savedResults.length > 0 ? (
                <ul className="space-y-4">
                    {savedResults.map(result => (
                        <li key={result.id} className="bg-background border border-border p-3 rounded-lg group">
                            <div className="flex items-start gap-3">
                              <img src={result.outputImage} alt={result.prompt} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                              <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-text truncate">{result.prompt}</p>
                                <p className="text-xs text-muted">{result.category} &bull; {new Date(result.timestamp).toLocaleDateString()}</p>
                              </div>
                              <button onClick={() => handleDeleteResult(result.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                            </div>
                            <button onClick={() => handleLoadResult(result)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted mt-8">No saved toys yet.</p>
            )}
        </div>
    </div>
    {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};