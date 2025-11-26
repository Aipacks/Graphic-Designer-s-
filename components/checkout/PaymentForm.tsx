import React, { useState } from 'react';
import { Spinner } from '../common/Spinner';

interface PaymentFormProps {
  onSubmit: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onSubmit();
    }, 2000);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 mt-6 md:mt-0">
      <h3 className="text-xl font-bold text-text mb-4">Payment Details</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-muted">Card Number</label>
          <input
            id="cardNumber"
            type="text"
            placeholder="**** **** **** 1234"
            required
            className="mt-1 block w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-muted">Expiry Date</label>
            <input
                id="expiryDate"
                type="text"
                placeholder="MM / YY"
                required
                className="mt-1 block w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>
            <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-muted">CVC</label>
            <input
                id="cvc"
                type="text"
                placeholder="123"
                required
                className="mt-1 block w-full bg-surface border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>
        </div>
        <button type="submit" disabled={isProcessing} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 shadow-sm flex items-center justify-center disabled:bg-gray-400">
          {isProcessing ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div> : 'Confirm Payment'}
        </button>
      </form>
    </div>
  );
};
