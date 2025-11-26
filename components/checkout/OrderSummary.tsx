import React from 'react';
import { PricingPlan } from '../../types';

interface OrderSummaryProps {
  plan: PricingPlan;
}

const CheckIcon = () => (
    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  );

export const OrderSummary: React.FC<OrderSummaryProps> = ({ plan }) => {
  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-xl font-bold text-text mb-4">Order Summary</h3>
      <div className="border-b border-border pb-4 mb-4">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold">{plan.name} Plan</span>
          <span className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted">/month</span></span>
        </div>
        <p className="text-muted text-sm mt-1">{plan.description}</p>
      </div>
      <ul className="space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon />
            <span className="ml-3 text-sm text-muted">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
