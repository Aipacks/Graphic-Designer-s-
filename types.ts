export enum View {
  Home = "Home",
  Toolkit = "Toolkit",
  Pricing = "Pricing",
  Profile = "Profile",
  Checkout = "Checkout",
  CheckoutSuccess = "CheckoutSuccess",
  Contact = "Contact",
  About = "About",
  Careers = "Careers",
  Legal = "Legal",
  Claim = "Claim",
  Privacy = "Privacy",
  Terms = "Terms",
}

export enum Tab {
  MoodBoard = "MoodBoard",
  ColorPalette = "ColorPalette",
  LogoIdeas = "LogoIdeas",
  FontPairings = "FontPairings",
  SketchToImage = "SketchToImage",
  MagicMorph = "MagicMorph",
  UXCopy = "UXCopy",
  Taglines = "Taglines",
  IllustrationIdeas = "IllustrationIdeas",
  SocialMediaPosts = "SocialMediaPosts",
  ImageDescription = "ImageDescription",
  IconSet = "IconSet",
  PresentationSlides = "PresentationSlides",
  BlogPostIdeas = "BlogPostIdeas",
  ProductNames = "ProductNames",
  AdCopy = "AdCopy",
  PhotoShootConcepts = "PhotoShootConcepts",
  PatternIdeas = "PatternIdeas",
  BrandArchetype = "BrandArchetype",
  CreativeBrief = "CreativeBrief",
  DesignTrends = "DesignTrends",
  ToyMaker = "ToyMaker",
  VectorStyleImage = "VectorStyleImage",
  AIComic = "AIComic",
  ImageBackgroundRemover = "ImageBackgroundRemover",
  ImageEnhancer = "ImageEnhancer",
  CustomCharacter = "CustomCharacter",
  EmojiArtist = "EmojiArtist",
  FuturePredictor = "FuturePredictor",
  SignatureGenerator = "SignatureGenerator",
  AIDreamStylist = "AIDreamStylist",
}

export type Language = 'en' | 'hi';

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
}

export interface User {
  name: string;
  email: string;
  plan?: string;
  credits?: number;
  referralCode?: string;
  notifications?: {
    newsletter: boolean;
    productUpdates: boolean;
    promotionalOffers: boolean;
  };
  language?: Language;
}

export interface Color {
  name: string;
  hex: string;
}

export interface LogoIdea {
    concept: string;
    description: string;
}

export interface FontPairing {
    heading: string;
    body: string;
    description: string;
}

export interface MoodBoard {
  id: string;
  prompt: string;
  images: string[];
  timestamp: number;
}

export interface SketchToImageResult {
  id: string;
  prompt: string;
  sketch: string; 
  outputImage: string;
  timestamp: number;
}

export interface MagicMorphResult {
  id: string;
  prompt: string;
  sourceImage: string;
  outputImage: string;
  timestamp: number;
}

export interface UXCopy {
    option: string;
    rationale: string;
}

export interface Tagline {
    tagline: string;
    style: string;
}

export interface IllustrationIdea {
    concept: string;
    description: string;
}

export interface SocialMediaPost {
    platform: string;
    postText: string;
    suggestion: string;
}

export interface IconIdea {
    concept: string;
    description: string;
}

export interface PresentationSlide {
    title: string;
    content: string[];
    visualIdea: string;
}

export interface BlogPostIdea {
    title: string;
    outline: string[];
}

export interface ProductName {
    name: string;
    rationale: string;
}

export interface AdCopy {
    headline: string;
    body: string;
    platform: string;
}

export interface PhotoShootConcept {
    concept: string;
    description: string;
}

export interface PatternIdea {
    name: string;
    description: string;
}

export interface BrandArchetype {
    archetype: string;
    description: string;
    designCues: string[];
}

export interface CreativeBriefSection {
    title: string;
    content: string;
}

export interface DesignTrend {
    name: string;
    explanation: string;
    characteristics: string[];
    sources?: { web: { uri: string; title: string } }[];
}

export interface FuturePredictionResult {
  id: string;
  timestamp: number;
  topic: string;
  timeframe: string;
  prediction: string;
  sources?: { web: { uri: string; title: string } }[];
}

export interface ToyMakerResult {
  id: string;
  prompt: string;
  category: string;
  sourceImage?: string;
  outputImage: string;
  timestamp: number;
}

export interface VectorStyleImageResult {
  id:string;
  prompt: string;
  style: string;
  aspectRatio: string;
  outputImage: string;
  timestamp: number;
}

export interface AIComicResult {
  id: string;
  timestamp: number;
  story: string;
  preset: string;
  style: string;
  layout: string;
  bubbleShape: string;
  fontSize: string;
  outputImage: string;
}

export interface ImageBackgroundRemoverResult {
  id: string;
  sourceImage: string;
  outputImage: string;
  timestamp: number;
}

export interface ImageEnhancerResult {
  id: string;
  sourceImage: string;
  outputImage: string;
  timestamp: number;
}

export interface CustomCharacterResult {
  id: string;
  timestamp: number;
  name: string;
  concept: string;
  personalityTraits: string;
  backstory: string;
  visualDescription: string;
  portraitImage: string;
  referenceImages: string[];
}

export interface EmojiArtistResult {
  id: string;
  prompt: string;
  sourceImage?: string;
  outputImage: string;
  timestamp: number;
}

export interface SignatureResult {
  id: string;
  name: string;
  outputImage: string;
  timestamp: number;
}

export interface AIDreamStylistResult {
  id: string;
  prompt: string;
  sourceImage: string;
  outputImage: string[];
  promptSuggestions?: string[];
  timestamp: number;
}