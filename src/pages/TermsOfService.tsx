
import React from "react";
import { SEO } from "@/components/SEO";
import { ScrollReveal } from "@/components/ScrollReveal";
import { scrollToTop } from "@/utils/scrollUtils";

export default function TermsOfService() {
  // Scroll to top when the component mounts
  React.useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <>
      <SEO
        title="Terms of Service | MedSafe Project"
        description="Terms of Service for the MedSafe Project website."
      />
      
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container-custom">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                How we collect, use, and protect your information
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
              <p className="text-sm text-gray-500 italic text-center mb-8">
                Last updated: May 18, 2025
              </p>
              
              <p className="mb-6">
                Welcome to MedSafeProject.org (the "Site"), operated by the MedSafe Project ("we," "us" or "our"). 
                By accessing or using the Site, you agree to these Terms of Service ("Terms"). Please read them carefully.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p className="mb-6">
                By using our Site, you acknowledge that you have read, understood, and agree to be bound by these Terms, 
                our Privacy Policy, and any additional terms posted on the Site.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                2. Changes to Terms
              </h2>
              <p className="mb-6">
                We may modify these Terms at any time. Changes become effective upon posting. Your continued use of 
                the Site after modifications constitutes acceptance of the new Terms.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                3. Use of the Site
              </h2>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-2">You may access and use the Site for your personal, non-commercial use only.</li>
                <li className="mb-2">You must be at least 13 years old. By using the Site, you represent that you meet this requirement.</li>
                <li className="mb-2">You agree not to misuse the Site or help anyone else do so.</li>
              </ul>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                4. Intellectual Property
              </h2>
              <p className="mb-6">
                All content on the Site—text, graphics, logos, images, and software—is our property or licensed to us and is 
                protected by copyright, trademark, and other laws. You may view and download content for your personal use only; 
                any other use requires our written permission.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                5. Third-Party Tools & Links
              </h2>
              <p className="mb-6">
                We may provide links to third-party websites or tools (e.g., Vitacheck). Linking does not imply endorsement. 
                We are not responsible for the content or practices of any third-party site.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                6. No Medical Advice
              </h2>
              <p className="mb-6">
                The Site provides educational information about medication safety. It is not a substitute for professional 
                medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with any medical questions.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                7. Disclaimers
              </h2>
              <p className="mb-6">
                THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS 
                FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                8. Limitation of Liability
              </h2>
              <p className="mb-6">
                IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES 
                ARISING OUT OF YOUR ACCESS TO OR USE OF THE SITE.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                9. Governing Law
              </h2>
              <p className="mb-6">
                These Terms are governed by the laws of the State of Arizona, without regard to its conflict-of-law principles.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                10. Contact Us
              </h2>
              <p className="mb-6">
                If you have any questions about these Terms, please contact us at admin@medsafeproject.org.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
