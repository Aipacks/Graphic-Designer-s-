import React, { useState } from 'react';

export const ClaimPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        claimType: 'Copyright Infringement',
        details: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate form submission
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', claimType: 'Copyright Infringement', details: '' });
            setTimeout(() => setStatus('idle'), 5000);
        }, 1500);
    };

    return (
        <div className="animate-fade-in py-16 px-4 bg-background">
            <div className="container mx-auto max-w-3xl">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4">File a Claim</h1>
                    <p className="text-lg text-muted max-w-2xl mx-auto">
                        Please use this form to report any issues related to copyright, service abuse, or other claims.
                    </p>
                </div>
                 <div className="bg-surface p-8 rounded-lg shadow-lg border border-border">
                    {status === 'success' ? (
                        <div className="bg-secondary/10 text-secondary p-4 rounded-lg text-center">
                            <h3 className="font-bold">Claim Submitted</h3>
                            <p>Thank you for your report. We have received your claim and will review it shortly. You will receive a confirmation email.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-muted">Full Name</label>
                                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-muted">Email Address</label>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="claimType" className="block text-sm font-medium text-muted">Type of Claim</label>
                                <select name="claimType" id="claimType" value={formData.claimType} onChange={handleChange} className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option>Copyright Infringement</option>
                                    <option>Service Abuse</option>
                                    <option>Payment Issue</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="details" className="block text-sm font-medium text-muted">Details of Claim</label>
                                <textarea name="details" id="details" rows={6} required value={formData.details} onChange={handleChange} placeholder="Please provide as much detail as possible, including links to content if applicable." className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                            </div>
                            <div>
                                <button type="submit" disabled={status === 'submitting'} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center">
                                    {status === 'submitting' ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        'Submit Claim'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};