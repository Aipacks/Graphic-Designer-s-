
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface SignupModalProps {
  onClose: () => void;
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ onClose, onSignup, onSwitchToLogin }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate signup
    onSignup({ name, email });
  };

  return (
    <Modal title={t('signup.title')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name-signup" className="block text-sm font-medium text-muted">{t('signup.nameLabel')}</label>
          <input
            id="name-signup"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="email-signup" className="block text-sm font-medium text-muted">{t('login.emailLabel')}</label>
          <input
            id="email-signup"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="password-signup" className="block text-sm font-medium text-muted">{t('login.passwordLabel')}</label>
          <input
            id="password-signup"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 shadow-sm">
          {t('signup.button')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {t('signup.switch')}{' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-primary hover:underline">
          {t('header.login')}
        </button>
      </p>
    </Modal>
  );
};
