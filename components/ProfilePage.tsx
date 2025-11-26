
import React, { useState } from 'react';
import { User, View, Language } from '../types';
import { Card } from './common/Card';
import { useLanguage } from '../contexts/LanguageContext';

// Icons
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-muted" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-muted" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-muted" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>;
const LanguageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.8 14.922l.21.35a2 2 0 001.84 1.127h2.302a2 2 0 001.84-1.128l.21-.35M15.2 14.922l-1.09-1.816a2 2 0 00-1.84-1.106h-2.54a2 2 0 00-1.84 1.106L7.8 14.922" /></svg>;

// Reusable Toggle Switch Component
const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-muted">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-primary' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            aria-checked={enabled}
            role="switch"
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
    </div>
);

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  setCurrentView: (view: View) => void;
  onCancelSubscription: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, setCurrentView, onCancelSubscription }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const [copySuccess, setCopySuccess] = useState(false);
    
    const [notificationPrefs, setNotificationPrefs] = useState(user.notifications || {
        newsletter: true,
        productUpdates: true,
        promotionalOffers: false,
    });

    const handleSaveDetails = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ ...user, name, email });
        setIsEditing(false);
        setSuccessMessage(t('profile.updateSuccess'));
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: t('profile.passwordNoMatch') });
            return;
        }
        if (newPassword.length < 6) {
             setPasswordMessage({ type: 'error', text: t('profile.passwordLength') });
             return;
        }
        // Simulate success
        setPasswordMessage({ type: 'success', text: t('profile.passwordUpdateSuccess') });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    };

    const handleNotificationToggle = (pref: keyof typeof notificationPrefs) => {
        const newPrefs = { ...notificationPrefs, [pref]: !notificationPrefs[pref] };
        setNotificationPrefs(newPrefs);
        onUpdateUser({ ...user, notifications: newPrefs });
    };
    
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value as Language;
        onUpdateUser({ ...user, language: newLanguage });
        setSuccessMessage(t('profile.languageUpdateSuccess'));
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const referralLink = `https://designers-toolkit.ai/ref=${user.referralCode}`;

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(referralLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="animate-fade-in py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-4xl font-extrabold text-text mb-8">{t('profile.dashboardTitle')}</h1>
                {successMessage && <div className="bg-secondary/10 text-secondary p-3 rounded-lg mb-6 text-center animate-fade-in">{successMessage}</div>}
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-8">
                        {/* Account Details & Password */}
                        <Card>
                            <form onSubmit={handleSaveDetails}>
                                <h2 className="text-2xl font-bold mb-6">{t('profile.accountDetails')}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-muted">{t('profile.name')}</label>
                                        <input id="name" type="text" value={name} onChange={e => {setName(e.target.value); setIsEditing(true);}} className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-muted">{t('profile.email')}</label>
                                        <input id="email" type="email" value={email} onChange={e => {setEmail(e.target.value); setIsEditing(true);}} className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="mt-6">
                                        <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105">{t('profile.saveChanges')}</button>
                                    </div>
                                )}
                            </form>
                            <div className="border-t border-border mt-6 pt-6">
                                <h3 className="text-xl font-bold mb-4 flex items-center"><LockIcon /> {t('profile.changePassword')}</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label htmlFor="current-password"  className="block text-sm font-medium text-muted">{t('profile.currentPassword')}</label>
                                        <input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="new-password"  className="block text-sm font-medium text-muted">{t('profile.newPassword')}</label>
                                            <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                                        </div>
                                        <div>
                                            <label htmlFor="confirm-password"  className="block text-sm font-medium text-muted">{t('profile.confirmNewPassword')}</label>
                                            <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"/>
                                        </div>
                                    </div>
                                    {passwordMessage.text && <p className={`${passwordMessage.type === 'error' ? 'text-red-500' : 'text-secondary'} text-sm`}>{passwordMessage.text}</p>}
                                    <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105">{t('profile.updatePassword')}</button>
                                </form>
                            </div>
                        </Card>
                        
                        <Card>
                             <h2 className="text-2xl font-bold mb-4 flex items-center"><ChartIcon /> {t('profile.usage')}</h2>
                             <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-3xl font-extrabold text-primary">12</p>
                                    <p className="text-muted">{t('profile.creationsSaved')}</p>
                                </div>
                                <div>
                                    {user.plan === 'Starter' ? (
                                        <>
                                            <p className="text-3xl font-extrabold text-primary">{20 - (user.credits || 0)}</p>
                                            <p className="text-muted">{t('profile.creditsUsed')}</p>
                                        </>
                                    ) : (
                                         <>
                                            <p className="text-3xl font-extrabold text-primary">2</p>
                                            <p className="text-muted">{t('profile.projectsStarted')}</p>
                                        </>
                                    )}
                                </div>
                             </div>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <Card>
                            <h2 className="text-2xl font-bold mb-4">{t('profile.myPlan')}</h2>
                            <div className="bg-primary/10 text-primary text-center py-2 px-4 rounded-lg font-bold text-lg mb-4">{user.plan}</div>
                            {user.plan === 'Starter' && (
                                <div className="text-center">
                                    <p className="text-4xl font-extrabold">{user.credits}</p>
                                    <p className="text-muted mb-4">{t('profile.creditsRemaining')}</p>
                                </div>
                            )}
                             {user.plan !== 'Starter' && (
                                <div className="text-center">
                                    <p className="text-muted">{t('profile.unlimitedAccess')}</p>
                                </div>
                            )}
                             <div className="border-t border-border mt-6 pt-6">
                                <h3 className="text-xl font-bold mb-4">{t('profile.manageSubscription')}</h3>
                                <div className="space-y-2">
                                    <button onClick={() => setCurrentView(View.Pricing)} className="w-full bg-primary/10 text-primary font-bold py-2 px-4 rounded-lg transition-colors hover:bg-primary/20">{t('profile.changePlan')}</button>
                                    {user.plan !== 'Starter' && 
                                        <button onClick={onCancelSubscription} className="w-full bg-red-500/10 text-red-600 font-bold py-2 px-4 rounded-lg transition-colors hover:bg-red-500/20">{t('profile.cancelSubscription')}</button>
                                    }
                                </div>
                            </div>
                        </Card>
                        
                        <Card>
                            <h2 className="text-2xl font-bold mb-4 flex items-center"><GiftIcon /> {t('profile.referFriend')}</h2>
                            <p className="text-muted mb-4">{t('profile.referralBlurb')}</p>
                            <div className="flex">
                                <input type="text" readOnly value={referralLink} className="flex-grow bg-background border-2 border-border rounded-l-lg p-2 text-text text-sm focus:outline-none"/>
                                <button onClick={handleCopyReferral} className="bg-secondary text-white font-bold py-2 px-4 rounded-r-lg text-sm flex items-center gap-2">{copySuccess ? t('copied') : <><ClipboardCopyIcon /> {t('profile.copy')}</>}</button>
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-2xl font-bold mb-4 flex items-center"><LanguageIcon /> {t('profile.languageRegion')}</h2>
                            <div>
                                <label htmlFor="language-select" className="block text-sm font-medium text-muted">{t('profile.language')}</label>
                                <select
                                    id="language-select"
                                    value={user.language || 'en'}
                                    onChange={handleLanguageChange}
                                    className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिन्दी (Hindi)</option>
                                </select>
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-2xl font-bold mb-4 flex items-center"><BellIcon /> {t('profile.notifications')}</h2>
                            <div className="space-y-2 divide-y divide-border">
                               <ToggleSwitch label={t('profile.newsletter')} enabled={notificationPrefs.newsletter} onChange={() => handleNotificationToggle('newsletter')} />
                               <ToggleSwitch label={t('profile.productUpdates')} enabled={notificationPrefs.productUpdates} onChange={() => handleNotificationToggle('productUpdates')} />
                               <ToggleSwitch label={t('profile.promotionalOffers')} enabled={notificationPrefs.promotionalOffers} onChange={() => handleNotificationToggle('promotionalOffers')} />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
