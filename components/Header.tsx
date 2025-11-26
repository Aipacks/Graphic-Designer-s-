
import React, { useState, useEffect, useRef } from 'react';
import { View, User } from '../types';
import { Logo } from './common/Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const NavButton: React.FC<{
  view: View;
  currentView: View;
  onClick: (view: View) => void;
  children: React.ReactNode;
  isMobile?: boolean;
}> = ({ view, currentView, onClick, children, isMobile = false }) => {
  const isActive = currentView === view;
  const baseClasses = "font-semibold transition-colors duration-300";
  const mobileClasses = `text-2xl py-4 w-full text-center ${isActive ? 'text-primary' : 'text-text hover:text-primary'}`;
  const desktopClasses = `px-4 py-2 rounded-md ${isActive ? 'text-primary' : 'text-text hover:text-primary'}`;

  return (
    <button
      onClick={() => onClick(view)}
      className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}
    >
      {children}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, isAuthenticated, currentUser, onLogout, onLoginClick, onSignupClick }) => {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 bg-surface/80 backdrop-blur-md z-50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
              <button onClick={() => handleNavClick(View.Home)}>
                  <Logo className="h-8"/>
              </button>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                  <NavButton view={View.Home} currentView={currentView} onClick={handleNavClick}>
                  {t('nav.home')}
                  </NavButton>
                  <NavButton view={View.Toolkit} currentView={currentView} onClick={handleNavClick}>
                  {t('nav.toolkit')}
                  </NavButton>
                  <NavButton view={View.Pricing} currentView={currentView} onClick={handleNavClick}>
                  {t('nav.pricing')}
                  </NavButton>
                   <NavButton view={View.Contact} currentView={currentView} onClick={handleNavClick}>
                   {t('nav.contact')}
                  </NavButton>
                  {isAuthenticated ? (
                    <div className="relative ml-4" ref={profileRef}>
                      <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-gray-100 py-2 px-4 rounded-lg">
                        <span>{t('header.welcome', { name: currentUser?.name || '' })}</span>
                        <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-xl py-2 z-20 border border-border animate-fade-in">
                          <div className="px-4 py-2 border-b border-border">
                            <p className="font-bold text-text">{t('header.plan', { plan: currentUser?.plan || '' })}</p>
                            {currentUser?.plan === 'Starter' && (
                              <p className="text-sm text-muted">{t('header.creditsRemaining', { credits: currentUser.credits || 0 })}</p>
                            )}
                          </div>
                          <button onClick={() => { setCurrentView(View.Profile); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-text hover:bg-gray-100">{t('header.profileDashboard')}</button>
                          <button onClick={() => { onLogout(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-text hover:bg-gray-100">{t('header.logout')}</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <button onClick={onLoginClick} className="font-semibold text-text hover:text-primary transition-colors px-4 py-2 ml-4">
                        {t('header.login')}
                      </button>
                      <button 
                        onClick={onSignupClick}
                        className="ml-2 bg-primary text-white font-semibold py-2 px-5 rounded-lg transition-transform hover:scale-105 shadow-sm">
                        {t('header.signup')}
                      </button>
                    </>
                  )}
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-text" aria-label="Open menu">
                      <MenuIcon />
                  </button>
              </div>
          </div>
        </div>
      </header>

       {/* Mobile Menu Panel */}
       <div className={`fixed top-0 right-0 h-full w-full bg-black/50 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <div className={`fixed top-0 right-0 h-full w-64 bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-end p-4">
                    <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex flex-col items-center justify-center h-full -mt-16">
                    <NavButton view={View.Home} currentView={currentView} onClick={handleNavClick} isMobile>{t('nav.home')}</NavButton>
                    <NavButton view={View.Toolkit} currentView={currentView} onClick={handleNavClick} isMobile>{t('nav.toolkit')}</NavButton>
                    <NavButton view={View.Pricing} currentView={currentView} onClick={handleNavClick} isMobile>{t('nav.pricing')}</NavButton>
                    <NavButton view={View.Contact} currentView={currentView} onClick={handleNavClick} isMobile>{t('nav.contact')}</NavButton>
                    <div className="border-t border-border w-4/5 my-4"></div>
                    {isAuthenticated ? (
                      <>
                        <span className="text-muted mb-4 text-center px-4 flex flex-col items-center">
                            {t('header.welcome', { name: currentUser?.name || '' })}
                            {currentUser?.plan && 
                                <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full mt-2 uppercase">{currentUser.plan}</span>
                            }
                            {currentUser?.plan === 'Starter' &&
                                <span className="text-xs text-muted mt-1">{t('header.creditsLeft', { credits: currentUser.credits || 0 })}</span>
                            }
                        </span>
                        <NavButton view={View.Profile} currentView={currentView} onClick={handleNavClick} isMobile>{t('header.dashboard')}</NavButton>
                        <button 
                          onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                          className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg mt-4">
                          {t('header.logout')}
                        </button>
                      </>
                    ) : (
                      <>
                        <NavButton view={currentView} currentView={currentView} onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} isMobile>{t('header.login')}</NavButton>
                        <button 
                          onClick={() => { onSignupClick(); setIsMobileMenuOpen(false); }}
                          className="mt-4 bg-primary text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">
                          {t('header.signupFree')}
                        </button>
                      </>
                    )}
                </nav>
            </div>
       </div>
    </>
  );
};
