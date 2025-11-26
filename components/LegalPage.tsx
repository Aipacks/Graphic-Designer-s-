import React from 'react';
import { View } from '../../types';

interface LegalPageProps {
  setCurrentView: (view: View) => void;
}

const LegalLinkCard: React.FC<{ title: string; description: string; onClick: () => void; }> = ({ title, description, onClick }) => (
    <button onClick={onClick} className="bg-background p-6 rounded-lg border border-border text-left w-full transition-all hover:shadow-md hover:border-primary">
        <h3 className="font-bold text-lg text-primary">{title}</h3>
        <p className="text-muted mt-1">{description}</p>
    </button>
);

export const LegalPage: React.FC<LegalPageProps> = ({ setCurrentView }) => {
  return (
    <div className="animate-fade-in py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4">Legal Center</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Important information about our services, policies, and your rights.
          </p>
        </div>

        <div className="bg-surface p-8 rounded-lg shadow-lg border border-border space-y-6">
            <LegalLinkCard 
                title="Terms of Service" 
                description="The rules and guidelines for using our services."
                onClick={() => setCurrentView(View.Terms)}
            />
            <LegalLinkCard 
                title="Privacy Policy" 
                description="How we collect, use, and protect your data."
                onClick={() => setCurrentView(View.Privacy)}
            />
             <LegalLinkCard 
                title="File a Claim" 
                description="Submit a claim regarding copyright or other service issues."
                onClick={() => setCurrentView(View.Claim)}
            />
        </div>
      </div>
    </div>
  );
};