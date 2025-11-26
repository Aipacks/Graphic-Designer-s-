
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, onSwitchToSignup }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login by extracting name from email
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    onLogin({ name, email });
  };

  return (
    <Modal title={t('login.title')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted">{t('login.emailLabel')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="password"  className="block text-sm font-medium text-muted">{t('login.passwordLabel')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 shadow-sm">
          {t('login.button')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {t('login.switch')}{' '}
        <button onClick={onSwitchToSignup} className="font-semibold text-primary hover:underline">
          {t('header.signup')}
        </button>
      </p>
    </Modal>
  );
};
