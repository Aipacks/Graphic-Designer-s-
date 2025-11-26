
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/HomePage';
import { ToolkitPage } from './components/ToolkitPage';
import { PricingPage } from './components/PricingPage';
import { View, User, PricingPlan, Language } from './types';
import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { CheckoutSuccessPage } from './components/checkout/CheckoutSuccessPage';
import { ProfilePage } from './components/ProfilePage';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { ContactPage } from './components/ContactPage';
import { AboutPage } from './components/AboutPage';
import { CareersPage } from './components/CareersPage';
import { LegalPage } from './components/LegalPage';
import { ClaimPage } from './components/ClaimPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);

  const handleLogin = (user: User) => {
    setIsAuthenticated(true);
    const plan = user.plan || 'Starter';
    // Give starter users credits if they don't have any (for simulation purposes)
    const credits = (plan === 'Starter' && user.credits === undefined) ? 20 : user.credits;
    const referralCode = user.referralCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const notifications = user.notifications || { newsletter: true, productUpdates: true, promotionalOffers: false };
    const language = user.language || 'en';
    setCurrentUser({ ...user, plan, credits, referralCode, notifications, language });
    setAuthModal(null);
  };

  const handleSignup = (user: User) => {
    setIsAuthenticated(true);
    // New users get the Starter plan with 20 free credits
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const notifications = { newsletter: true, productUpdates: true, promotionalOffers: false };
    const language: Language = 'en';
    setCurrentUser({ ...user, plan: 'Starter', credits: 20, referralCode, notifications, language });
    setAuthModal(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView(View.Home);
  };
  
  const deductCredits = (amount: number) => {
    if (currentUser && currentUser.credits !== undefined) {
      setCurrentUser({ ...currentUser, credits: Math.max(0, currentUser.credits - amount) });
    }
  };

  const handleGoToCheckout = (plan: PricingPlan) => {
    if (isAuthenticated) {
      // Don't allow checkout for the same or a lower plan
      if (currentUser?.plan === plan.name) return;
      if (currentUser?.plan === 'Pro' && plan.name === 'Starter') return;
      if (currentUser?.plan === 'Team') return;

      setSelectedPlan(plan);
      setCurrentView(View.Checkout);
    } else {
      setAuthModal('login');
    }
  };

  const handlePaymentSuccess = () => {
    if (currentUser && selectedPlan) {
      // When upgrading, remove credits as they become unlimited
      const updatedUser = { ...currentUser, plan: selectedPlan.name, credits: undefined };
      setCurrentUser(updatedUser);
      setCurrentView(View.CheckoutSuccess);
    }
  };

  const handleCancelSubscription = () => {
    if (currentUser && currentUser.plan !== 'Starter') {
        // Downgrade to starter, reset credits. In a real app, this would be scheduled.
        const updatedUser = { ...currentUser, plan: 'Starter', credits: 0 };
        setCurrentUser(updatedUser);
    }
    setCancelModalOpen(false);
  };


  const renderContent = () => {
    switch (currentView) {
      case View.Home:
        return <HomePage setCurrentView={setCurrentView} />;
      case View.Toolkit:
        return <ToolkitPage 
                  isAuthenticated={isAuthenticated} 
                  onAuthRequired={() => setAuthModal('login')} 
                  currentUser={currentUser}
                  onDeductCredits={deductCredits}
                  setCurrentView={setCurrentView}
                />;
      case View.Pricing:
        return <PricingPage onCheckout={handleGoToCheckout} currentUser={currentUser} />;
      case View.Profile:
        return currentUser ? (
          <ProfilePage 
            user={currentUser}
            onUpdateUser={setCurrentUser}
            setCurrentView={setCurrentView}
            onCancelSubscription={() => setCancelModalOpen(true)}
          />
        ) : <HomePage setCurrentView={setCurrentView} />;
      case View.Contact:
        return <ContactPage />;
      case View.Checkout:
        return selectedPlan && currentUser ? (
          <CheckoutPage 
            plan={selectedPlan} 
            user={currentUser} 
            onPaymentSuccess={handlePaymentSuccess} 
            onBack={() => setCurrentView(View.Pricing)} 
          />
        ) : <PricingPage onCheckout={handleGoToCheckout} currentUser={currentUser} />;
      case View.CheckoutSuccess:
        return selectedPlan ? (
          <CheckoutSuccessPage 
            plan={selectedPlan} 
            onDone={() => setCurrentView(View.Toolkit)} 
          />
        ) : <HomePage setCurrentView={setCurrentView} />;
      case View.About:
        return <AboutPage />;
      case View.Careers:
        return <CareersPage />;
      case View.Legal:
        return <LegalPage setCurrentView={setCurrentView} />;
      case View.Claim:
        return <ClaimPage />;
      case View.Privacy:
        return <PrivacyPage />;
      case View.Terms:
        return <TermsPage />;
      default:
        return <HomePage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <LanguageProvider userLanguage={currentUser?.language}>
      <div className="min-h-screen bg-background text-text font-sans flex flex-col">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={handleLogout}
          onLoginClick={() => setAuthModal('login')}
          onSignupClick={() => setAuthModal('signup')}
        />
        <main className="flex-grow">
          {renderContent()}
        </main>
        <Footer setCurrentView={setCurrentView} />

        {authModal === 'login' && (
          <LoginModal
            onClose={() => setAuthModal(null)}
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthModal('signup')}
          />
        )}
        {authModal === 'signup' && (
          <SignupModal
            onClose={() => setAuthModal(null)}
            onSignup={handleSignup}
            onSwitchToLogin={() => setAuthModal('login')}
          />
        )}

        <ConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelSubscription}
          title="Cancel Subscription"
          message="Are you sure you want to cancel your subscription? Your plan will be downgraded to the Starter tier at the end of your current billing cycle."
          confirmText="Yes, Cancel"
        />
      </div>
    </LanguageProvider>
  );
};

export default App;
