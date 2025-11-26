import React, { useState, useRef, useEffect } from 'react';
import { MoodBoardGenerator } from './MoodBoardGenerator';
import { ColorPaletteGenerator } from './ColorPaletteGenerator';
import { LogoIdeaGenerator } from './LogoIdeaGenerator';
import { FontPairingSuggester } from './FontPairingSuggester';
import { Tab, User, View } from '../types';
import { UXCopyWriter } from './UXCopyWriter';
import { TaglineGenerator } from './TaglineGenerator';
import { IllustrationIdeaGenerator } from './IllustrationIdeaGenerator';
import { SocialMediaPostGenerator } from './SocialMediaPostGenerator';
import { ImageDescriptionGenerator } from './ImageDescriptionGenerator';
import { IconSetGenerator } from './IconSetGenerator';
import { PresentationSlideSuggester } from './PresentationSlideSuggester';
import { BlogPostIdeaGenerator } from './BlogPostIdeaGenerator';
import { ProductNameAssistant } from './ProductNameAssistant';
import { AdCopyGenerator } from './AdCopyGenerator';
import { PhotoShootConceptGenerator } from './PhotoShootConceptGenerator';
import { PatternIdeaGenerator } from './PatternIdeaGenerator';
import { BrandArchetypeIdentifier } from './BrandArchetypeIdentifier';
import { CreativeBriefAssistant } from './CreativeBriefAssistant';
import { DesignTrendExplainer } from './DesignTrendExplainer';
import { SketchToImageGenerator } from './SketchToImageGenerator';
import { ToyMakerGenerator } from './ToyMakerGenerator';
import { VectorStyleImageGenerator } from './VectorStyleImageGenerator';
import { MagicMorphGenerator } from './MagicMorphGenerator';
import { AIComicGenerator } from './AIComicGenerator';
import { ImageBackgroundRemover } from './ImageBackgroundRemover';
import { ImageEnhancer } from './ImageEnhancer';
import { CustomCharacterCreator } from './CustomCharacterCreator';
import { EmojiArtistGenerator } from './EmojiArtistGenerator';
import { SignatureGenerator } from './SignatureGenerator';
import { FuturePredictor } from './FuturePredictor';
import { AIDreamStylist } from './AIDreamStylist';

const toolDisplayNames: { [key in Tab]: string } = {
  [Tab.MoodBoard]: "Mood Board",
  [Tab.ColorPalette]: "Color Palette",
  [Tab.LogoIdeas]: "Logo Ideas",
  [Tab.FontPairings]: "Font Pairings",
  [Tab.SketchToImage]: "Sketch to Image",
  [Tab.MagicMorph]: "Magic Morph",
  [Tab.AIComic]: "AI Comic",
  [Tab.UXCopy]: "UX Copy",
  [Tab.Taglines]: "Taglines",
  [Tab.IllustrationIdeas]: "Illustration Ideas",
  [Tab.SocialMediaPosts]: "Social Posts",
  [Tab.ImageDescription]: "Image Desc",
  [Tab.IconSet]: "Icon Set",
  [Tab.PresentationSlides]: "Slides",
  [Tab.BlogPostIdeas]: "Blog Ideas",
  [Tab.ProductNames]: "Product Names",
  [Tab.AdCopy]: "Ad Copy",
  [Tab.PhotoShootConcepts]: "Photo Concepts",
  [Tab.PatternIdeas]: "Patterns",
  [Tab.BrandArchetype]: "Archetype",
  [Tab.CreativeBrief]: "Brief",
  [Tab.DesignTrends]: "Trends",
  [Tab.FuturePredictor]: "Future Predictor",
  [Tab.ToyMaker]: "Toy Maker",
  [Tab.VectorStyleImage]: "Vector Style",
  [Tab.ImageBackgroundRemover]: "BG Remover",
  [Tab.ImageEnhancer]: "AI Enhance",
  [Tab.CustomCharacter]: "Character Creator",
  [Tab.EmojiArtist]: "Emoji Artist",
  [Tab.SignatureGenerator]: "AI Signature",
  [Tab.AIDreamStylist]: "AI Dream Stylist",
};


const ToolNavButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-all duration-300 whitespace-nowrap ${
        isActive
          ? 'bg-primary text-white shadow-md'
          : 'text-text hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
};

interface ToolkitPageProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  currentUser: User | null;
  onDeductCredits: (amount: number) => void;
  setCurrentView: (view: View) => void;
}

export const ToolkitPage: React.FC<ToolkitPageProps> = ({ isAuthenticated, onAuthRequired, currentUser, onDeductCredits, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ToyMaker);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mainTools: Tab[] = [
    Tab.ToyMaker,
    Tab.CustomCharacter,
    Tab.VectorStyleImage,
    Tab.AIComic,
    Tab.MoodBoard,
    Tab.EmojiArtist,
    Tab.MagicMorph,
    Tab.ImageBackgroundRemover,
  ];
  const allTools = Object.values(Tab);
  const dropdownTools = allTools.filter(t => !mainTools.includes(t));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setDropdownOpen(false);
  }

  const renderContent = () => {
    const authProps = { isAuthenticated, onAuthRequired };
    const imageToolProps = { ...authProps, currentUser, onDeductCredits, setCurrentView };
    
    switch (activeTab) {
      // Image tools that use credits
      case Tab.MoodBoard: return <MoodBoardGenerator {...imageToolProps} />;
      case Tab.SketchToImage: return <SketchToImageGenerator {...imageToolProps} />;
      case Tab.MagicMorph: return <MagicMorphGenerator {...imageToolProps} />;
      case Tab.AIComic: return <AIComicGenerator {...imageToolProps} />;
      case Tab.ToyMaker: return <ToyMakerGenerator {...imageToolProps} />;
      case Tab.VectorStyleImage: return <VectorStyleImageGenerator {...imageToolProps} />;
      case Tab.ImageBackgroundRemover: return <ImageBackgroundRemover {...imageToolProps} />;
      case Tab.ImageEnhancer: return <ImageEnhancer {...imageToolProps} />;
      case Tab.CustomCharacter: return <CustomCharacterCreator {...imageToolProps} />;
      case Tab.EmojiArtist: return <EmojiArtistGenerator {...imageToolProps} />;
      case Tab.SignatureGenerator: return <SignatureGenerator {...imageToolProps} />;
      case Tab.AIDreamStylist: return <AIDreamStylist {...imageToolProps} />;
      
      // Text/Other tools that don't use credits
      case Tab.ColorPalette: return <ColorPaletteGenerator {...authProps} />;
      case Tab.LogoIdeas: return <LogoIdeaGenerator {...authProps} />;
      case Tab.FontPairings: return <FontPairingSuggester {...authProps} />;
      case Tab.UXCopy: return <UXCopyWriter {...authProps} />;
      case Tab.Taglines: return <TaglineGenerator {...authProps} />;
      case Tab.IllustrationIdeas: return <IllustrationIdeaGenerator {...authProps} />;
      case Tab.SocialMediaPosts: return <SocialMediaPostGenerator {...authProps} />;
      case Tab.ImageDescription: return <ImageDescriptionGenerator {...authProps} />;
      case Tab.IconSet: return <IconSetGenerator {...authProps} />;
      case Tab.PresentationSlides: return <PresentationSlideSuggester {...authProps} />;
      case Tab.BlogPostIdeas: return <BlogPostIdeaGenerator {...authProps} />;
      case Tab.ProductNames: return <ProductNameAssistant {...authProps} />;
      case Tab.AdCopy: return <AdCopyGenerator {...authProps} />;
      case Tab.PhotoShootConcepts: return <PhotoShootConceptGenerator {...authProps} />;
      case Tab.PatternIdeas: return <PatternIdeaGenerator {...authProps} />;
      case Tab.BrandArchetype: return <BrandArchetypeIdentifier {...authProps} />;
      case Tab.CreativeBrief: return <CreativeBriefAssistant {...authProps} />;
      case Tab.DesignTrends: return <DesignTrendExplainer {...authProps} />;
      case Tab.FuturePredictor: return <FuturePredictor {...authProps} />;

      default: return <ToyMakerGenerator {...imageToolProps} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
       <nav className="flex justify-center mb-8">
         <div className="flex flex-wrap justify-center items-center gap-2 bg-surface p-2 rounded-lg shadow-sm border border-border">
            {mainTools.map(tab => (
              <ToolNavButton key={tab} isActive={activeTab === tab} onClick={() => handleTabClick(tab)}>
                {toolDisplayNames[tab]}
              </ToolNavButton>
            ))}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-all duration-300 whitespace-nowrap text-text hover:bg-gray-200 flex items-center gap-1"
              >
                More Tools
                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-surface border border-border rounded-lg shadow-xl py-2 z-10 w-48">
                  {dropdownTools.map(tab => (
                     <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-primary/10 text-primary' : 'text-text'} hover:bg-gray-100`}
                    >
                      {toolDisplayNames[tab]}
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>
      </nav>
      <main className="bg-surface p-6 md:p-8 rounded-xl shadow-lg border border-border min-h-[70vh]">
        {renderContent()}
      </main>
    </div>
  );
};