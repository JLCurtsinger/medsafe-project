import React from 'react';
import { SEO } from '@/components/SEO';

const Blog: React.FC = () => {
  return (
    <>
      <SEO
        title="Blog | MedSafe Project"
        description="Stay updated with the latest insights, research, and developments in medication safety from the MedSafe Project team."
        keywords={[
          'medication safety blog',
          'drug interaction news',
          'patient safety updates',
          'healthcare blog',
          'medication safety research',
        ]}
      />

      <div className="min-h-screen bg-white dark:bg-charcoal">
        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal dark:text-white mb-4">
                Blog
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Stay updated with the latest insights, research, and developments in medication safety.
              </p>
            </div>

            {/* AutoAuthor Embed */}
            <iframe
                src="/embed/view.html?brand=MedSafe%20Project&theme=minimal&glow=%239333ea&layout=compact"
                style="border:none;width:100%;height:400px;border-radius:8px;"
                loading="lazy"
              ></iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
