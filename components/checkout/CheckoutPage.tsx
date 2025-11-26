import React from 'react';
import { PricingPlan, User } from '../../types';
import { OrderSummary } from './OrderSummary';
import { PaymentForm } from './PaymentForm';

interface CheckoutPageProps {
  plan: PricingPlan;
  user: User;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ plan, user, onPaymentSuccess, onBack }) => {
  return (
    <div className="animate-fade-in py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-muted font-semibold hover:text-primary mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Pricing
        </button>
        <h1 className="text-4xl font-extrabold text-text mb-8">Complete Your Purchase</h1>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <OrderSummary plan={plan} />
          </div>
          <div>
            <PaymentForm onSubmit={onPaymentSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
};
