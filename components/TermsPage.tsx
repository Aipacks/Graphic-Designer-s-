import React from 'react';

export const TermsPage: React.FC = () => {
    return (
        <div className="animate-fade-in py-16 px-4 bg-background">
            <div className="container mx-auto max-w-3xl">
                <div className="bg-surface p-8 sm:p-12 rounded-lg shadow-lg border border-border prose max-w-none">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-text mb-6">Terms of Service</h1>
                    <p className="text-muted">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2>1. Agreement to Terms</h2>
                    <p>By using the Designer's AI Toolkit application (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.</p>
                    
                    <h2>2. Use of the Service</h2>
                    <p>You may use the Service for personal and commercial purposes to create content ("Creations"). You are responsible for the prompts you provide and the Creations you generate. You agree not to use the Service to create harmful, illegal, or infringing content.</p>

                    <h2>3. Ownership of Creations</h2>
                    <p>You own the rights to the Creations you generate using the Service, subject to the rights of any third-party content included in your prompts and the policies of the underlying AI model providers. We do not claim any ownership rights in your Creations.</p>

                    <h2>4. Subscriptions and Payments</h2>
                    <p>The Service may require payment. By subscribing to a plan, you agree to pay the specified fees. All payments are handled by a secure third-party payment processor. Subscriptions are billed on a monthly basis and are non-refundable.</p>

                    <h2>5. Termination</h2>
                    <p>We may terminate or suspend your access to the Service at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.</p>
                    
                    <h2>6. Disclaimers</h2>
                    <p>The Service is provided "AS IS," without warranty of any kind. We do not warrant that the Service will meet your requirements or be available on an uninterrupted, secure, or error-free basis. The output of the AI is generated automatically and may not always be accurate or appropriate.</p>

                    <h2>7. Changes to These Terms</h2>
                    <p>We reserve the right to modify these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.</p>
                </div>
            </div>
        </div>
    );
};