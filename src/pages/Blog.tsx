
import React from 'react';
import { SEO } from '@/components/SEO';

const Blog: React.FC = () => {
  return (
    <>
      <SEO
        title="Blog | MedSafe Project"
        description="Stay updated with the latest insights, research, and developments in medication safety from the MedSafe Project team."
        keywords={['medication safety blog', 'drug interaction news', 'patient safety updates', 'healthcare blog', 'medication safety research']}
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
            
            <div id="autoauthor-blog-embed"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
