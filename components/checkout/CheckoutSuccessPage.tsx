import React from 'react';
import { PricingPlan } from '../../types';

interface CheckoutSuccessPageProps {
  plan: PricingPlan;
  onDone: () => void;
}

export const CheckoutSuccessPage: React.FC<CheckoutSuccessPageProps> = ({ plan, onDone }) => {
  return (
    <div className="animate-fade-in py-24 px-4 text-center">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-secondary/10 text-secondary p-4 rounded-full inline-block mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-text mb-4">Payment Successful!</h1>
        <p className="text-lg text-muted mb-8">
          Congratulations! You have successfully subscribed to the <span className="font-bold text-primary">{plan.name}</span> plan. You can now access all the amazing features.
        </p>
        <button onClick={onDone} className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
          Go to Toolkit
        </button>
      </div>
    </div>
  );
};
