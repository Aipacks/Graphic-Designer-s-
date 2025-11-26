import React from 'react';
import { PricingPlan, User } from '../types';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

interface PricingCardProps {
  plan: PricingPlan;
  onCheckout: (plan: PricingPlan) => void;
  currentPlan?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onCheckout, currentPlan }) => {
  const isCurrentPlan = plan.name === currentPlan;
  const isDowngrade = (currentPlan === 'Pro' && plan.name === 'Starter') || (currentPlan === 'Team');
  const isDisabled = isCurrentPlan || isDowngrade;

  let buttonText = 'Get Started';
  if (isCurrentPlan) {
    buttonText = 'Current Plan';
  } else if (isDowngrade) {
    buttonText = 'N/A';
  } else if (plan.name === 'Pro' && currentPlan === 'Starter') {
    buttonText = 'Upgrade to Pro'
  }


  return (
    <div className={`border rounded-lg p-8 flex flex-col ${plan.isFeatured ? 'bg-primary text-white border-primary shadow-2xl' : 'bg-surface border-border'}`}>
      {plan.isFeatured && (
        <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">MOST POPULAR</span>
      )}
      <h3 className={`text-2xl font-bold ${plan.isFeatured ? 'text-white' : 'text-text'}`}>{plan.name}</h3>
      <p className={`mt-2 ${plan.isFeatured ? 'text-gray-300' : 'text-muted'}`}>{plan.description}</p>
      <div className="mt-6">
        <span className={`text-5xl font-extrabold ${plan.isFeatured ? 'text-white' : 'text-text'}`}>{plan.price}</span>
        <span className={`ml-2 text-lg ${plan.isFeatured ? 'text-gray-300' : 'text-muted'}`}>/ month</span>
      </div>
      <ul className="mt-8 space-y-4 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon />
            <span className="ml-3">{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => onCheckout(plan)}
        disabled={isDisabled}
        className={`w-full mt-10 py-3 px-6 font-bold rounded-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${plan.isFeatured ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
        {buttonText}
      </button>
    </div>
  );
};

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for individuals and hobbyists starting out.",
    features: [
      "20 free image generation credits",
      "Access to all text-based tools",
      "Standard Quality Exports",
      "Save your creations"
    ]
  },
  {
    name: "Pro",
    price: "$19",
    description: "For freelancers and professionals who need more power.",
    features: [
      "Unlimited image generations",
      "Unlimited access to all tools",
      "High-Resolution Exports",
      "Priority Support"
    ],
    isFeatured: true
  },
  {
    name: "Team",
    price: "$49",
    description: "For agencies and teams that collaborate on projects.",
    features: [
      "All features in Pro",
      "Team Collaboration Tools",
      "Shared Asset Libraries",
      "Dedicated Account Manager",
      "Centralized Billing"
    ]
  }
];

interface PricingPageProps {
    onCheckout: (plan: PricingPlan) => void;
    currentUser: User | null;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onCheckout, currentUser }) => {
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text">Find the Perfect Plan</h1>
          <p className="mt-4 text-lg text-muted">
            Whether you're a solo creative or a growing team, we have a plan that fits your needs. Start for free and upgrade anytime.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map(plan => (
            <PricingCard key={plan.name} plan={plan} onCheckout={onCheckout} currentPlan={currentUser?.plan} />
          ))}
        </div>
      </div>
    </div>
  );
};