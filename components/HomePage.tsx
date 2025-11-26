import React, { useState } from 'react';
import { View } from '../types';

interface HomePageProps {
  setCurrentView: (view: View) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-surface p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
    <div className="flex items-center mb-4">
      <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text">{title}</h3>
    </div>
    <p className="text-muted">{children}</p>
  </div>
);

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


export const HomePage: React.FC<HomePageProps> = ({ setCurrentView }) => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-text mb-4 leading-tight">
          Amplify Your Creativity. <span className="text-primary">Instantly.</span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted mb-8">
          Welcome to your new creative co-pilot. Our AI-powered toolkit streamlines your design process, from initial mood boards to final social media posts, letting you focus on what truly matters: creating stunning visuals.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => setCurrentView(View.Toolkit)} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg w-full sm:w-auto">
            Explore the Toolkit
          </button>
          <button onClick={() => setCurrentView(View.Pricing)} className="bg-surface text-primary font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 border border-border shadow-lg w-full sm:w-auto">
            View Pricing
          </button>
        </div>
      </section>

       {/* Social Proof Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
            <h2 className="text-sm font-bold uppercase text-muted tracking-widest mb-6">Trusted by the world's best creative teams</h2>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
                <span className="text-2xl font-bold text-gray-400">CreativeCo</span>
                <span className="text-2xl font-bold text-gray-400">Visionary</span>
                <span className="text-2xl font-bold text-gray-400">PixelPerfect</span>
                <span className="text-2xl font-bold text-gray-400">Artisan Inc.</span>
                <span className="text-2xl font-bold text-gray-400">StudioNext</span>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-surface px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text">A Full Suite of Design Tools</h2>
            <p className="text-muted max-w-2xl mx-auto mt-2">Everything you need to kickstart and complete your creative projects, all in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} title="Mood Board Generator">
              Instantly generate stunning mood boards from a simple text prompt to establish your project's visual direction.
            </FeatureCard>
             <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>} title="Color Palette Creator">
              Describe a theme or upload an image to create harmonious and accessible color palettes in seconds.
            </FeatureCard>
            <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} title="Custom Character Creator">
              Design, 'train', and bring your own unique characters to life. Generate consistent visuals for your creations.
            </FeatureCard>
            <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 18s1-1.5 3-2 3 0 4-1 2-3 2-3" /></svg>} title="AI Signature Generator">
              Create a unique, professional signature in seconds. Simply enter your name and let AI design a personalized signature.
            </FeatureCard>
            <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} title="Emoji Artist">
              Generate unique custom emojis for people or characters based on your description.
            </FeatureCard>
            <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232zM5 19v-4h4" /></svg>} title="Sketch to Image">
              Transform your rough sketches into polished, high-quality images with the power of AI.
            </FeatureCard>
          </div>
        </div>
      </section>

       {/* How It Works Section */}
      <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-text">Unleash Your Creativity in 3 Simple Steps</h2>
              <p className="text-muted max-w-2xl mx-auto mt-2 mb-12">Our intuitive toolkit is designed to get you from idea to masterpiece in record time.</p>
              <div className="grid md:grid-cols-3 gap-8 relative">
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
                      <svg width="100%" height="2" className="text-border">
                          <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                      </svg>
                  </div>
                  <div className="relative bg-background p-6 rounded-lg border border-border z-10">
                      <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                      <h3 className="text-xl font-bold mb-2">Choose Your Tool</h3>
                      <p className="text-muted">Select from our extensive suite of AI-powered tools, from Mood Boards to Magic Morph.</p>
                  </div>
                   <div className="relative bg-background p-6 rounded-lg border border-border z-10">
                      <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                      <h3 className="text-xl font-bold mb-2">Describe Your Vision</h3>
                      <p className="text-muted">Provide a simple text prompt, upload an image, or fill in a few fields. The more detail, the better!</p>
                  </div>
                   <div className="relative bg-background p-6 rounded-lg border border-border z-10">
                      <div className="bg-secondary/10 text-secondary w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                      <h3 className="text-xl font-bold mb-2">Create Instantly</h3>
                      <p className="text-muted">Watch as the AI generates stunning, professional-quality results in seconds, ready to use in your projects.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-surface px-4">
          <div className="container mx-auto text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-text mb-12">Why Creatives Love Our Toolkit</h2>
             <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 <blockquote className="bg-background p-8 rounded-lg border border-border shadow-sm">
                   <p className="text-lg text-text mb-4 italic">"This toolkit has become an indispensable part of my workflow. It's like having a junior designer that never sleeps and is always full of brilliant ideas!"</p>
                   <footer className="font-semibold text-muted">&mdash; Jessica Chen, <span className="text-primary">Freelance Brand Strategist</span></footer>
                 </blockquote>
                  <blockquote className="bg-background p-8 rounded-lg border border-border shadow-sm">
                   <p className="text-lg text-text mb-4 italic">"I was stuck on a project, but after generating a few mood boards and color palettes, the ideas started flowing. This tool is a creativity supercharger."</p>
                   <footer className="font-semibold text-muted">&mdash; Mike Rodriguez, <span className="text-primary">UI/UX Designer at TechCo</span></footer>
                 </blockquote>
             </div>
          </div>
      </section>
      
      {/* Pricing Preview Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text">Pricing That Scales With You</h2>
            <p className="text-muted max-w-2xl mx-auto mt-2 mb-12">From hobbyists to enterprise teams, we've got a plan that's right for you.</p>
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="border border-border rounded-lg p-8 flex flex-col text-left">
                    <h3 className="text-2xl font-bold text-text">Starter</h3>
                    <p className="mt-2 text-muted flex-grow">For individuals and hobbyists.</p>
                    <div className="mt-6">
                        <span className="text-5xl font-extrabold text-text">$0</span>
                    </div>
                    <ul className="mt-8 space-y-2">
                        <li className="flex items-center"><svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>20 free credits</li>
                        <li className="flex items-center"><svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Access to all tools</li>
                    </ul>
                </div>
                 <div className="border-2 border-primary rounded-lg p-8 flex flex-col text-left shadow-2xl relative">
                    <span className="absolute top-0 -translate-y-1/2 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full self-center">MOST POPULAR</span>
                    <h3 className="text-2xl font-bold text-primary">Pro</h3>
                    <p className="mt-2 text-muted flex-grow">For professionals and freelancers.</p>
                    <div className="mt-6">
                        <span className="text-5xl font-extrabold text-text">$19</span>
                        <span className="ml-2 text-lg text-muted">/ month</span>
                    </div>
                     <ul className="mt-8 space-y-2">
                        <li className="flex items-center"><svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Unlimited Generations</li>
                        <li className="flex items-center"><svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>High-Res Exports</li>
                    </ul>
                </div>
                 <div className="border border-border rounded-lg p-8 flex flex-col text-left">
                    <h3 className="text-2xl font-bold text-text">Team</h3>
                    <p className="mt-2 text-muted flex-grow">For agencies and creative teams.</p>
                    <div className="mt-6">
                        <span className="text-5xl font-extrabold text-text">$49</span>
                         <span className="ml-2 text-lg text-muted">/ month</span>
                    </div>
                     <ul className="mt-8 space-y-2">
                        <li className="flex items-center"><svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>All Pro features</li>
                        <li className="flex items-center"><svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Team Collaboration</li>
                    </ul>
                </div>
            </div>
             <button onClick={() => setCurrentView(View.Pricing)} className="mt-12 bg-primary/10 text-primary font-bold py-3 px-8 rounded-lg transition-colors hover:bg-primary/20">
                Compare All Plans & Features
            </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-surface px-4">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                <div className="space-y-2">
                    <FaqItem q="Can I use the generated images and content commercially?" a="Yes, absolutely. All content you create with our tools is yours to use for both personal and commercial projects, according to our terms of service." />
                    <FaqItem q="What happens when I run out of credits on the Starter plan?" a="If you run out of your 20 free credits, you can easily upgrade to our Pro plan for unlimited generations. We do not offer top-up credits for the Starter plan at this time." />
                    <FaqItem q="How does the AI work?" a="Our toolkit is powered by advanced large language and diffusion models, including Google's Gemini family of models. When you provide a prompt, the AI analyzes it and generates a unique output based on its vast training data." />
                    <FaqItem q="Can I cancel my subscription at any time?" a="Yes, you can cancel your Pro or Team subscription at any time from your profile dashboard. You will retain access to your plan's features until the end of your current billing cycle." />
                </div>
            </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto text-center bg-surface p-8 sm:p-12 rounded-lg shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-text">Ready to Revolutionize Your Workflow?</h2>
          <p className="text-muted max-w-2xl mx-auto mt-2 mb-8">
            Stop waiting for inspiration and start creating. Dive into the toolkit and experience the future of design.
          </p>
          <button onClick={() => setCurrentView(View.Toolkit)} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
            Get Started for Free
          </button>
          <p className="text-xs text-muted mt-2">Includes 20 free image generation credits.</p>
        </div>
      </section>
    </div>
  );
};