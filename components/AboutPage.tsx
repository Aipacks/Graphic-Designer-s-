import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="animate-fade-in py-16 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4">About Us</h1>
          <p className="text-lg text-muted">Powering the next generation of creative professionals.</p>
        </div>

        <div className="bg-surface p-8 rounded-lg shadow-lg border border-border space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Our Mission</h2>
            <p className="text-muted leading-relaxed">
              Our mission is to build the ultimate creative co-pilot for designers, artists, and marketers. We believe that AI should be a tool to amplify human creativity, not replace it. By automating tedious tasks and providing powerful inspirational tools, we empower our users to focus on what they do best: creating stunning, impactful work that pushes boundaries.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Our Story</h2>
            <p className="text-muted leading-relaxed mb-4">
              Founded in a small studio by a team of designers and engineers, Designer's AI Toolkit was born from a shared frustration: too much time was spent on repetitive tasks, and not enough on pure creation. We saw the potential of generative AI to change the game. We started with a simple mood board generator and have since grown into a comprehensive suite of tools designed to streamline every step of the creative workflow.
            </p>
            <p className="text-muted leading-relaxed">
              Today, we are proud to serve a global community of freelancers, agencies, and in-house creative teams who rely on our toolkit to produce their best work faster than ever before.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">Meet the Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <img src="https://picsum.photos/seed/jane/200" alt="Jane Doe" className="w-32 h-32 rounded-full mx-auto mb-4 shadow-md"/>
                <h3 className="font-bold text-text text-lg">Jane Doe</h3>
                <p className="text-muted">CEO & Co-Founder</p>
              </div>
              <div className="text-center">
                <img src="https://picsum.photos/seed/john/200" alt="John Smith" className="w-32 h-32 rounded-full mx-auto mb-4 shadow-md"/>
                <h3 className="font-bold text-text text-lg">John Smith</h3>
                <p className="text-muted">CTO & Co-Founder</p>
              </div>
              <div className="text-center">
                <img src="https://picsum.photos/seed/emily/200" alt="Emily White" className="w-32 h-32 rounded-full mx-auto mb-4 shadow-md"/>
                <h3 className="font-bold text-text text-lg">Emily White</h3>
                <p className="text-muted">Head of Design</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};