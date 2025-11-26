import React from 'react';

const JobCard: React.FC<{ title: string; location: string; department: string; }> = ({ title, location, department }) => (
    <div className="bg-background p-6 rounded-lg border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-shadow hover:shadow-md">
        <div>
            <h3 className="font-bold text-lg text-primary">{title}</h3>
            <p className="text-muted mt-1">{location} &bull; {department}</p>
        </div>
        <button className="bg-primary text-white font-bold py-2 px-5 rounded-lg transition-transform hover:scale-105 shadow-sm whitespace-nowrap mt-4 sm:mt-0">
            Apply Now
        </button>
    </div>
);

export const CareersPage: React.FC = () => {
  return (
    <div className="animate-fade-in py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-4">Join Our Team</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            We're on a mission to revolutionize the creative industry. If you're passionate about design, technology, and empowering creators, we want to hear from you.
          </p>
        </div>

        <div className="bg-surface p-8 rounded-lg shadow-lg border border-border space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Why Work With Us?</h2>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="bg-background p-4 rounded-md">
                        <h3 className="font-semibold text-text">Creative Freedom</h3>
                        <p className="text-sm text-muted">Innovate and experiment. Your ideas shape our product.</p>
                    </div>
                     <div className="bg-background p-4 rounded-md">
                        <h3 className="font-semibold text-text">Remote-First Culture</h3>
                        <p className="text-sm text-muted">Work from anywhere. We value results, not location.</p>
                    </div>
                     <div className="bg-background p-4 rounded-md">
                        <h3 className="font-semibold text-text">Growth Opportunities</h3>
                        <p className="text-sm text-muted">Learn and grow with a talented, passionate team.</p>
                    </div>
                </div>
            </div>

             <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Current Openings</h2>
                <div className="space-y-4">
                    <JobCard title="Senior Frontend Engineer" location="Remote" department="Engineering" />
                    <JobCard title="Product Designer (UI/UX)" location="Remote" department="Design" />
                    <JobCard title="AI/ML Research Scientist" location="Remote" department="Engineering" />
                    <JobCard title="Content Marketing Manager" location="Remote" department="Marketing" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};