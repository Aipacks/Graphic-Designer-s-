import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in px-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-surface rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-transform animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-text text-3xl font-light leading-none" aria-label="Close modal">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
