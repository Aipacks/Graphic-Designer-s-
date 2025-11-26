import React, { useState } from 'react';

// Icons
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate form submission
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        }, 1500);
    };

    return (
        <div className="animate-fade-in py-16 px-4 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4">Contact Us</h1>
                    <p className="max-w-2xl mx-auto text-lg text-muted">
                        Have a question, a project idea, or just want to say hello? We'd love to hear from you.
                    </p>
                </div>

                <div className="bg-surface p-8 rounded-lg shadow-lg border border-border grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-bold text-text mb-6">Send a Message</h2>
                        {status === 'success' ? (
                            <div className="bg-secondary/10 text-secondary p-4 rounded-lg text-center">
                                <h3 className="font-bold">Thank you!</h3>
                                <p>Your message has been sent successfully. We'll get back to you shortly.</p>
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
                                    <label htmlFor="subject" className="block text-sm font-medium text-muted">Subject</label>
                                    <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-muted">Message</label>
                                    <textarea name="message" id="message" rows={5} required value={formData.message} onChange={handleChange} className="mt-1 block w-full bg-background border-2 border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                                </div>
                                <div>
                                    <button type="submit" disabled={status === 'submitting'} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center">
                                        {status === 'submitting' ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Contact Info & Map */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-text mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <MailIcon />
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-text">Email Us</h3>
                                        <a href="mailto:support@designerstoolkit.ai" className="text-muted hover:text-primary">support@designerstoolkit.ai</a>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <LocationIcon />
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-text">Our Office</h3>
                                        <p className="text-muted">123 Design Lane<br />Creativity City, CA 90210</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text mb-4">Follow Us</h3>
                            <div className="flex gap-4">
                                <a href="#" className="text-muted hover:text-primary"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.65 19.57h2.61L6.774 3.078h-2.61l13.318 17.645z" /></svg></a>
                                <a href="#" className="text-muted hover:text-primary"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m.29 9.94v-8.37H5.6v8.37h1.57z" /></svg></a>
                                <a href="#" className="text-muted hover:text-primary"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg></a>
                            </div>
                        </div>
                        <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                           <div className="w-full h-full bg-center bg-cover" style={{backgroundImage: "url('https://storage.googleapis.com/aistudio-public/enterprise_project_995333/map_placeholder_1721060931168.png')"}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};