import React from 'react';

export const PrivacyPage: React.FC = () => {
    return (
        <div className="animate-fade-in py-16 px-4 bg-background">
            <div className="container mx-auto max-w-3xl">
                <div className="bg-surface p-8 sm:p-12 rounded-lg shadow-lg border border-border prose max-w-none">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-text mb-6">Privacy Policy</h1>
                    <p className="text-muted">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2>1. Introduction</h2>
                    <p>Welcome to Designer's AI Toolkit ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
                    
                    <h2>2. Information We Collect</h2>
                    <p>We may collect personal information that you provide to us, such as your name, email address, and payment information when you subscribe to a plan. We also collect data related to your usage of our tools, such as prompts and generated content, to improve our services.</p>

                    <h2>3. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, operate, and maintain our services.</li>
                        <li>Improve, personalize, and expand our services.</li>
                        <li>Process your transactions and manage your subscription.</li>
                        <li>Communicate with you, including for customer service and support.</li>
                        <li>Send you updates, security alerts, and administrative messages.</li>
                    </ul>

                    <h2>4. Data Storage and Security</h2>
                    <p>Your data, including saved creations, is stored securely. For features that use local storage, your data remains on your device's browser. For account information, we use industry-standard security measures to protect your information from unauthorized access.</p>

                    <h2>5. Third-Party Services</h2>
                    <p>We may use third-party services, such as payment processors and AI model providers (e.g., Google Gemini), to provide our services. These third parties have their own privacy policies, and we encourage you to review them.</p>

                    <h2>6. Your Rights</h2>
                    <p>You have the right to access, update, or delete your personal information. You can manage your account details from your Profile page. If you wish to cancel your account, please contact us.</p>
                    
                    <h2>7. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
                </div>
            </div>
        </div>
    );
};