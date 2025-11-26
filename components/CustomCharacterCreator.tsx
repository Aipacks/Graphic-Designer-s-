
import React, { useState, useEffect } from 'react';
import { generateCharacterDescription, generateToyImage } from '../services/geminiService';
import { CustomCharacterResult } from '../types';
import { Spinner } from './common/Spinner';

// SVG Icon Components
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left gap-4">
        <h3 className="font-semibold text-text">{q}</h3>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}>
        <p className="text-muted pr-6">{a}</p>
      </div>
    </div>
  );
};

const formInitialState = {
    name: '',
    concept: '',
    personalityTraits: '',
    backstory: '',
    visualDescription: '',
    portraitImage: '',
    referenceImages: [] as string[],
};

interface CustomCharacterCreatorProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const CustomCharacterCreator: React.FC<CustomCharacterCreatorProps> = ({ isAuthenticated, onAuthRequired }) => {
  const [characterData, setCharacterData] = useState(formInitialState);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedCharacters, setSavedCharacters] = useState<CustomCharacterResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedCustomCharacters');
      if (stored) setSavedCharacters(JSON.parse(stored));
    } catch (e) { console.error("Failed to parse saved characters from localStorage", e); }
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever savedCharacters changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('savedCustomCharacters', JSON.stringify(savedCharacters));
    }
  }, [savedCharacters, isInitialLoad]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCharacterData(prev => ({ ...prev, [name]: value }));
  };

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const totalFiles = referenceFiles.length + files.length;
        if (totalFiles > 10) {
            setError('You can upload a maximum of 10 reference images.');
            return;
        }

        setReferenceFiles(prev => [...prev, ...files]);

        // FIX: Explicitly type `file` as `File` to help TypeScript's type inference
        // within the Promise and map structure, resolving the 'unknown' type error.
        const fileReadPromises = files.map((file: File) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(fileReadPromises).then(newPreviews => {
            setCharacterData(prev => ({
                ...prev,
                referenceImages: [...prev.referenceImages, ...newPreviews]
            }));
        });
        
        // Clear the input value to allow re-uploading the same file
        e.target.value = '';
    }
  };

  const removeReferenceImage = (indexToRemove: number) => {
    setReferenceFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setCharacterData(prev => ({
        ...prev,
        referenceImages: prev.referenceImages.filter((_, index) => index !== indexToRemove)
    }));
  };


  const handleGenerateDescription = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!characterData.name || !characterData.concept) {
        setError('Please provide at least a Name and a Core Concept.');
        return;
    }
    setError(null);
    setLoading(true);
    try {
        const description = await generateCharacterDescription(characterData.name, characterData.concept, characterData.personalityTraits, characterData.backstory, referenceFiles);
        setCharacterData(prev => ({...prev, visualDescription: description}));
        setStep(2);
    } catch(err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setLoading(false);
    }
  };

  const handleGeneratePortrait = async () => {
     if (!isAuthenticated) {
        onAuthRequired();
        return;
    }
     if (!characterData.visualDescription) {
        setError('A visual description is required to generate a portrait.');
        return;
    }
    setError(null);
    setLoading(true);
    setCharacterData(prev => ({...prev, portraitImage: ''}));
    try {
        // Pass a category argument to generateToyImage to fix argument count error
        const image = await generateToyImage(`character sheet, full body portrait of ${characterData.name}, ${characterData.visualDescription}`, 'Action Figure');
        setCharacterData(prev => ({...prev, portraitImage: image}));
    } catch(err: any) {
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
    if (characterData.portraitImage) {
      const newCharacter: CustomCharacterResult = {
        id: currentResultId || Date.now().toString(),
        timestamp: Date.now(),
        ...characterData,
      };
      
      if (savedCharacters.some(c => c.id === currentResultId)) {
         setSavedCharacters(chars => chars.map(c => c.id === currentResultId ? newCharacter : c));
      } else {
        setSavedCharacters([newCharacter, ...savedCharacters]);
        setCurrentResultId(newCharacter.id);
      }
    }
  };

  const handleLoad = (character: CustomCharacterResult) => {
    setCharacterData({
        name: character.name,
        concept: character.concept,
        personalityTraits: character.personalityTraits,
        backstory: character.backstory,
        visualDescription: character.visualDescription,
        portraitImage: character.portraitImage,
        referenceImages: character.referenceImages || [],
    });
    setReferenceFiles([]); // Cannot restore File objects, but previews are kept
    setCurrentResultId(character.id);
    setStep(2);
    setShowHistory(false);
    document.getElementById('character-creator-tool')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDelete = (id: string) => {
    setSavedCharacters(chars => chars.filter(c => c.id !== id));
  };
  
  const startOver = () => {
    setCharacterData(formInitialState);
    setReferenceFiles([]);
    setCurrentResultId(null);
    setError(null);
    setStep(1);
  };

  const renderTool = () => {
    switch(step) {
        case 1:
            return (
                <div className="w-full max-w-2xl animate-fade-in">
                    <h3 className="text-xl font-bold text-center mb-1 text-primary">Step 1: Define Your Character</h3>
                    <p className="text-center mb-6 text-muted">Provide the core details. The more info you give, the better the result.</p>
                    <div className="space-y-4">
                        <input type="text" name="name" placeholder="Character Name (e.g., 'Kaelen Shadowhand')" value={characterData.name} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <input type="text" name="concept" placeholder="Core Concept (e.g., 'Witty rogue with a mysterious past')" value={characterData.concept} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <input type="text" name="personalityTraits" placeholder="Personality Traits (e.g., 'Sarcastic, loyal, quick-thinking')" value={characterData.personalityTraits} onChange={handleInputChange} className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <textarea name="backstory" placeholder="Brief Backstory (e.g., 'Orphaned at a young age, they learned to survive on the streets...')" value={characterData.backstory} onChange={handleInputChange} rows={4} className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Reference Images (up to 10, optional)</label>
                            <label htmlFor="reference-upload" className="cursor-pointer bg-gray-100 text-text font-bold py-2 px-4 rounded-lg text-center transition-colors hover:bg-gray-200 block">
                                Upload Images
                            </label>
                            <input id="reference-upload" type="file" multiple accept="image/*" onChange={handleReferenceImageChange} className="hidden" />
                            {characterData.referenceImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {characterData.referenceImages.map((img, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img src={img} alt={`Reference ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                            <button onClick={() => removeReferenceImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <button onClick={handleGenerateDescription} disabled={loading} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                            {loading ? 'Generating...' : 'Next: Create Visuals'}
                        </button>
                    </div>
                </div>
            );
        case 2:
            return (
                 <div className="w-full max-w-5xl animate-fade-in">
                    <h3 className="text-xl font-bold text-center mb-1 text-primary">Step 2: Generate Visuals</h3>
                    <p className="text-center mb-6 text-muted">Refine the AI's visual description, then generate a portrait.</p>
                    <div className="grid md:grid-cols-5 gap-8">
                        <div className="md:col-span-3">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">References</label>
                                {characterData.referenceImages.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2 bg-surface p-2 rounded-lg border">
                                        {characterData.referenceImages.map((img, index) => (
                                            <img key={index} src={img} alt={`Ref ${index+1}`} className="w-full h-full object-cover rounded aspect-square" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted text-sm p-4 bg-surface rounded-lg border text-center">No reference images provided.</div>
                                )}
                            </div>
                             <div className="mt-4">
                                <label className="block text-sm font-medium text-muted mb-1">Visual Description (Editable)</label>
                                <textarea name="visualDescription" value={characterData.visualDescription} onChange={handleInputChange} rows={10} className="w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                             </div>
                        </div>
                        <div className="md:col-span-2 flex flex-col">
                            <div className="w-full aspect-square bg-surface border border-border rounded-lg p-2 flex items-center justify-center">
                                {loading && <Spinner />}
                                {characterData.portraitImage && !loading && <img src={characterData.portraitImage} alt="Character Portrait" className="max-h-full max-w-full object-contain rounded-md"/>}
                                {!characterData.portraitImage && !loading && <p className="text-muted text-center p-4">Your character portrait will appear here.</p>}
                            </div>
                            <button onClick={handleGeneratePortrait} disabled={loading} className="w-full mt-4 bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                                {loading ? 'Generating...' : 'Generate / Regenerate Portrait'}
                            </button>
                        </div>
                    </div>
                     <div className="text-center mt-6 flex flex-wrap justify-center gap-4">
                        <button onClick={() => setStep(1)} className="bg-gray-200 text-text font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105">Back</button>
                        <button onClick={handleSave} disabled={!isAuthenticated || !characterData.portraitImage} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-gray-300">
                           <SaveIcon /> {savedCharacters.some(c => c.id === currentResultId) ? 'Saved' : 'Save Character'}
                        </button>
                     </div>
                </div>
            )
    }
  }
  
  const examples = [
    {
      image: "https://picsum.photos/seed/captain-comet/400",
      name: "Captain Comet",
      concept: "A geriatric superhero with cosmic powers and a bad back."
    },
    {
      image: "https://picsum.photos/seed/jinx-cyberpunk/400",
      name: "Jinx",
      concept: "A cyberpunk bard who plays a holographic guitar."
    },
    {
      image: "https://picsum.photos/seed/elara-mage/400",
      name: "Elara",
      concept: "A shy forest mage whose magic comes from plants."
    }
  ];

  const features = [
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        title: "AI-Powered Consistency",
        description: "Our AI analyzes your description and reference images to create a detailed visual profile, ensuring your character looks consistent every time."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        title: "From Idea to Image",
        description: "Effortlessly turn your imagination into reality. Go from a simple concept to a fully-realized character portrait in just two steps."
      },
      {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
        title: "Iterate & Refine",
        description: "You're in control. Edit the AI-generated visual description and regenerate portraits until you achieve the perfect look for your character."
      },
  ];

  const testimonials = [
      {
        quote: "This tool has been a game-changer for my world-building. I can finally put a face to the names in my stories, and the consistency is incredible.",
        name: "Samantha Reed",
        title: "Fantasy Author"
      },
      {
        quote: "As an indie game developer, creating consistent character art was a huge bottleneck. The Character Creator saves me days of work on every project.",
        name: "Marco Diaz",
        title: "Indie Game Developer"
      },
  ];

   const faqs = [
      {
        q: "How does the AI create a consistent character?",
        a: "The AI first generates a highly detailed text description based on your inputs and reference images. This description acts as a 'character sheet' for the image generation model, ensuring key features like hair color, clothing, and style remain consistent."
      },
      {
        q: "What are the best reference images to use?",
        a: "Use images that clearly show the style, mood, clothing, or specific features you like. You can mix and match—use one for the art style, another for the outfit, and another for the hairstyle."
      },
      {
        q: "Can I use these characters commercially?",
        a: "Yes, you are free to use the characters and images you create in your personal and commercial projects, according to our terms of service."
      },
      {
        q: "How do I save my characters?",
        a: "Once you've generated a portrait you're happy with, just click the 'Save Character' button. You can access all your saved creations from the 'My Characters' panel anytime."
      },
  ];

  const pageUrl = "https://aistudio.google.com/";
  const shareText = "Check out this amazing AI Character Creator!";
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(shareText)}`;


  return (
    <>
      <div className="animate-fade-in -m-6 md:-m-8">
        {/* Section 1: The Creator Tool */}
        <section id="character-creator-tool" className="text-center py-12 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4 leading-tight">
              Bring Your Characters to Life
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted mb-8">
              Design, train, and visualize unique characters with consistent features. Describe your vision, add reference images, and let our AI create your next hero, villain, or mascot.
            </p>
            <div className="flex justify-end w-full max-w-5xl mx-auto mb-4">
                <button onClick={() => setShowHistory(true)} className="bg-surface text-text p-3 rounded-lg transition-colors hover:bg-gray-100 border border-border flex items-center gap-2" aria-label="View my characters">
                    <HistoryIcon /> My Characters
                </button>
            </div>
          </div>
          <div className="flex flex-col items-center bg-surface p-6 md:p-8 rounded-xl shadow-lg border border-border min-h-[70vh]">
            {renderTool()}
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            {step === 2 && currentResultId && <button onClick={startOver} className="text-sm text-primary hover:underline mt-4">Create a New Character</button>}
          </div>
        </section>

        {/* Section 2: Examples/Gallery */}
        <section className="py-16 bg-background px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Meet the Creations</h2>
            <p className="text-muted max-w-2xl mx-auto mb-10">Explore a gallery of unique characters brought to life by the AI Character Creator.</p>
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

        {/* Section 3: Features */}
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

        {/* Section 4: Testimonials */}
        <section className="py-16 bg-background px-4">
          <div className="container mx-auto text-center">
             <h2 className="text-3xl font-bold mb-10">Trusted by World-Builders</h2>
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
                <h2 className="text-3xl font-bold mb-4">Ready to Create Your Next Legend?</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">Stop imagining and start creating. Build your first character now and bring your story to life.</p>
                <button onClick={() => document.getElementById('character-creator-tool')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                    Start Creating Now
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
              <h3 className="text-xl font-bold text-text">My Characters</h3>
              <button onClick={() => setShowHistory(false)} className="text-text font-bold text-2xl">&times;</button>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
              {savedCharacters.length > 0 ? (
                  <ul className="space-y-4">
                      {savedCharacters.map(char => (
                          <li key={char.id} className="bg-background border border-border p-3 rounded-lg group">
                              <div className="flex items-start gap-3">
                                <img src={char.portraitImage} alt={char.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                  <p className="font-semibold text-text truncate">{char.name}</p>
                                  <p className="text-xs text-muted truncate">{char.concept}</p>
                                </div>
                                <button onClick={() => handleDelete(char.id)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon /></button>
                              </div>
                              <button onClick={() => handleLoad(char)} className="w-full text-center mt-2 bg-gray-100 text-text font-semibold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm">Load</button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-center text-muted mt-8">No saved characters yet.</p>
              )}
          </div>
      </div>
       {showHistory && <div onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/50 z-40" />}
    </>
  );
};
