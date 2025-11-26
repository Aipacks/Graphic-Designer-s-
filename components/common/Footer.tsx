
import React from 'react';
import { Logo } from './Logo';
import { View } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface FooterProps {
  setCurrentView: (view: View) => void;
}

const FooterLink: React.FC<{ view: View, setCurrentView: (view: View) => void, children: React.ReactNode }> = ({ view, setCurrentView, children }) => (
    <li>
        <button onClick={() => setCurrentView(view)} className="text-muted hover:text-primary transition-colors duration-300">
            {children}
        </button>
    </li>
);

export const Footer: React.FC<FooterProps> = ({setCurrentView}) => {
  const { t } = useLanguage();
  const SocialIcon: React.FC<{ href: string, path: string, label: string }> = ({ href, path, label }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors" aria-label={label}>
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d={path} />
      </svg>
    </a>
  );

  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="md:col-span-4 lg:col-span-2">
                 <button onClick={() => setCurrentView(View.Home)} className="inline-block mb-4">
                    <Logo className="h-8 justify-start"/>
                </button>
                <p className="text-muted max-w-sm mb-4">
                  {t('footer.tagline')}
                </p>
                 <div className="flex gap-4">
                    <SocialIcon label="X (formerly Twitter)" href="https://x.com/google" path="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.65 19.57h2.61L6.774 3.078h-2.61l13.318 17.645z" />
                    <SocialIcon label="LinkedIn" href="https://www.linkedin.com/company/google/" path="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m.29 9.94v-8.37H5.6v8.37h1.57z" />
                    <SocialIcon label="Instagram" href="https://www.instagram.com/google" path="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                 </div>
            </div>

            <div>
                <h3 className="font-bold text-text mb-4">{t('footer.toolkit')}</h3>
                <ul className="space-y-3">
                    <FooterLink view={View.Home} setCurrentView={setCurrentView}>{t('nav.home')}</FooterLink>
                    <FooterLink view={View.Toolkit} setCurrentView={setCurrentView}>{t('nav.toolkit')}</FooterLink>
                    <FooterLink view={View.Pricing} setCurrentView={setCurrentView}>{t('nav.pricing')}</FooterLink>
                    <FooterLink view={View.Contact} setCurrentView={setCurrentView}>{t('nav.contact')}</FooterLink>
                </ul>
            </div>
            
            <div>
                <h3 className="font-bold text-text mb-4">{t('footer.company')}</h3>
                <ul className="space-y-3">
                    <FooterLink view={View.About} setCurrentView={setCurrentView}>{t('footer.about')}</FooterLink>
                    <FooterLink view={View.Careers} setCurrentView={setCurrentView}>{t('footer.careers')}</FooterLink>
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-text mb-4">{t('footer.legal')}</h3>
                <ul className="space-y-3">
                    <FooterLink view={View.Legal} setCurrentView={setCurrentView}>{t('footer.legalHub')}</FooterLink>
                    <FooterLink view={View.Terms} setCurrentView={setCurrentView}>{t('footer.terms')}</FooterLink>
                    <FooterLink view={View.Privacy} setCurrentView={setCurrentView}>{t('footer.privacy')}</FooterLink>
                    <FooterLink view={View.Claim} setCurrentView={setCurrentView}>{t('footer.claim')}</FooterLink>
                </ul>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-muted text-sm">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};
