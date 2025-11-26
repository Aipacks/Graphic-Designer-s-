import React, { useState, useEffect } from 'react';
import { generateColorPaletteFromText, generateColorPaletteFromImage } from '../services/geminiService';
import { Color } from '../types';
import { Spinner } from './common/Spinner';
import { ColorSwatch } from './common/ColorSwatch';

// Icons
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface SavedPalette {
  id: string;
  timestamp: number;
  prompt: string;
  imagePreview: string | null;
  palette: Color[];
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

interface ColorPaletteGeneratorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const ColorPaletteGenerator: React.FC<ColorPaletteGeneratorProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [palette, setPalette] = useState<Color[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [currentPaletteId, setCurrentPaletteId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedColorPalettes');
      if (stored) setSavedPalettes(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedColorPalettes', JSON.stringify(savedPalettes));
    }
  }, [savedPalettes, isInitialLoad]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPrompt('');
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleGenerate();
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    if (!prompt && !imageFile) {
      setError('Please enter a description or upload an image.');
      return;
    }
    setError(null);
    setLoading(true);
    setPalette([]);
    setCurrentPaletteId(null);
    try {
      const result = imageFile ? await generateColorPaletteFromImage(imageFile) : await generateColorPaletteFromText(prompt);
      setPalette(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }
  
  const handleSave = () => {
    if (palette.length > 0) {
      const newSave: SavedPalette = {
        id: currentPaletteId || Date.now().toString(),
        timestamp: Date.now(),
        prompt: prompt,
        imagePreview: imagePreview,
        palette: palette,
      };
      if (currentPaletteId) {
        setSavedPalettes(p => p.map(item => item.id === currentPaletteId ? newSave : item));
      } else {
        setSavedPalettes([newSave, ...savedPalettes]);
        setCurrentPaletteId(newSave.id);
      }
    }
  };

  const handleLoad = (item: SavedPalette) => {
    setPrompt(item.prompt);
    setImagePreview(item.imagePreview);
    setPalette(item.palette);
    setCurrentPaletteId(item.id);
    setImageFile(null); // Can't restore file object
    setShowHistory(false);
  };

  const handleDelete = (id: string) => {
    setSavedPalettes(p => p.filter(item => item.id !== id));
  };
  
  const handleCopy = () => {
    const textToCopy = palette.map(c => `${c.name}: ${c.hex}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = palette.map(c => `${c.name}: ${c.hex}`).join('\n');
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color_palette_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        title: "Generate from Text",
        description: "Get palettes from moods, themes, or concepts like 'serene autumn forest' or 'cyberpunk city'."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        title: "Extract from Image",
        description: "Upload any photo to pull out its dominant, harmonious colors, perfect for branding or design projects."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        title: "Instant & Actionable",
        description: "Get color names and HEX codes you can copy and use immediately in Figma, Photoshop, or your CSS."
      },
  ];

  const testimonials = [
      {
        quote: "This tool is my secret weapon for kickstarting any branding project. I can generate a dozen beautiful, relevant color schemes in the time it used to take me to find one.",
        name: "Aisha Khan",
        title: "Brand Designer"
      },
      {
        quote: "I love uploading a photo that inspires me and instantly getting a workable palette. It's transformed my web design workflow.",
        name: "Ben Carter",
        title: "Web Developer"
      },
  ];

   const faqs = [
      {
        q: "What kind of prompts work best for text generation?",
        a: "Be descriptive! The more detail you provide about the mood, setting, or style, the better. Try combining concepts, like 'A cozy, rainy day in a London library' or 'A vibrant, retro 80s arcade'."
      },
      {
        q: "Are the generated palettes accessibility-friendly?",
        a: "The AI aims for harmonious color combinations, but you should always check the contrast ratios of your final color pairings using a dedicated contrast checker to ensure they meet accessibility standards like WCAG."
      },
      {
        q: "Can I export the palettes?",
        a: "You can easily copy the HEX codes for all colors, or download a .txt file of the palette to use in your projects. We're working on more export options for the future!"
      },
  ];

  return (
    <>
    <div className="animate-fade-in -m-6 md:-m-8">
        {/* Hero Section */}
        <section className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              Find the Perfect Color Palette. <span className="text-primary">Instantly.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
             Describe a theme or upload an image, and our AI will generate a beautiful, harmonious 5-color palette in seconds.
            </p>
             <button onClick={() => document.getElementById('palette-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                Create a Palette
            </button>
            <div className="mt-8 text-sm text-muted">
                A favorite tool for Brand Designers, Web Developers, and Interior Designers ⭐⭐⭐⭐⭐
            </div>
          </div>
        </section>

        {/* The Tool Section */}
        <section id="palette-tool" className="py-16 bg-surface px-4">
          <div className="container mx-auto max-w-4xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Palette Generator</h2>
              <button onClick={() => setShowHistory(true)} className="bg-background text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View history">
                  <HistoryIcon /> History
              </button>
            </div>
            
            <div className="w-full bg-background border border-border p-4 rounded-lg mb-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => { setPrompt(e.target.value); handleRemoveImage(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., a serene autumn forest"
                    disabled={!!imageFile}
                    className="flex-grow w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <span className="self-center text-muted font-semibold">OR</span>
                <label htmlFor="image-upload" className="cursor-pointer bg-gray-100 text-text font-bold py-3 px-6 rounded-lg text-center transition-colors hover:bg-gray-200 w-full sm:w-auto">
                    Upload Image
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
                {imagePreview && (
                <div className="mt-4 relative w-48 mx-auto">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg" />
                    <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">&times;</button>
                </div>
                )}
            </div>

            <div className="flex gap-2 mb-8">
                <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                {loading ? 'Generating...' : 'Generate Palette'}
                </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading && <Spinner />}

            {palette.length > 0 && (
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text">Generated Palette</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handleCopy} title="Copy HEX codes" className="flex items-center gap-2 bg-background text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-100 border border-border"><ClipboardCopyIcon /></button>
                    <button onClick={handleDownload} title="Download .txt" className="flex items-center gap-2 bg-background text-text font-bold p-2 rounded-lg transition-colors hover:bg-gray-100 border border-border"><DownloadIcon /></button>
                    <button onClick={handleSave} disabled={!isAuthenticated || !!savedPalettes.find(p => p.id === currentPaletteId)} className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                        <SaveIcon/> {!!savedPalettes.find(p => p.id === currentPaletteId) ? 'Saved' : 'Save'}
                    </button>
                </div>
                </div>
                {copySuccess && <p className="text-green-600 text-center mb-2">Copied to clipboard!</p>}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {palette.map((color) => (
                        <ColorSwatch key={color.hex} color={color} />
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
             <h2 className="text-3xl font-bold mb-10">Why Creatives Love This Tool</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Color Your World?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop guessing and start creating with purpose. Generate your perfect color palette now.</p>
                <button onClick={() => document.getElementById('palette-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Generate Your First Palette
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
            {savedPalettes.length > 0 ? (
                <ul className="space-y-4">
                    {savedPalettes.map(item => (
                        <li key={item.id} className="bg-background border border-border p-3 rounded-lg group">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-shrink-0 -space-x-2">
                                {item.palette.slice(0,3).map(c => <div key={c.hex} className="w-10 h-10 rounded-full border-2 border-white" style={{backgroundColor: c.hex}}></div>)}
                              </div>
                              <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-text truncate">{item.prompt || 'From Image'}</p>
                                <p className="text-xs text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                              </div>
                              <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><TrashIcon /></button>
                            </div>
                            <button onClick={() => handleLoad(item)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 text-sm">Load</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted mt-8">No saved palettes yet.</p>
            )}
        </div>
    </div>
    {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};