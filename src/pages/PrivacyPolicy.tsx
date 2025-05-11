
import { ScrollReveal } from "@/components/ScrollReveal";
import { SEO } from "@/components/SEO";

export default function PrivacyPolicy() {
  const privacyPolicySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy | MedSafe Project",
    "description": "Privacy policy and data practices for the MedSafe Project website.",
    "url": "https://medsafeproject.org/privacy-policy"
  };

  return (
    <>
      <SEO 
        title="Privacy Policy | MedSafe Project"
        description="Privacy policy and data practices for the MedSafe Project website."
        keywords={["privacy policy", "data protection", "GDPR", "cookie policy", "medication safety"]}
        schemaData={privacyPolicySchema}
      />
      
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container-custom">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                How we collect, use, and protect your information
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
              <p className="text-sm text-gray-500 italic text-center mb-8">
                Last updated: May 10, 2025
              </p>
              
              <p className="mb-6">
                Welcome to MedSafe Project. We are committed to protecting your privacy and maintaining transparency about how this site works. This Privacy Policy outlines what data we collect, how it is used, and what your rights are as a visitor.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                1. Who We Are
              </h2>
              <p className="mb-6">
                The MedSafe Project (https://www.medsafeproject.org) is an independent, public-interest initiative focused on raising awareness about the dangers of adverse drug interactions. We provide educational content, campaign materials, and references to trusted tools — but we do <strong>not</strong> offer medical services or collect personal health data.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                2. What We Collect
              </h2>
              <p className="mb-4">
                We do not directly collect any personal information from you. However, we do use third-party services that may collect limited, non-personal data for analytics and advertising purposes.
              </p>
              
              <h3 className="text-xl font-serif font-semibold mt-6 mb-3 text-charcoal dark:text-white">
                a. Google Analytics
              </h3>
              <p className="mb-4">
                We use Google Analytics to understand how users interact with our website. Data collected may include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Pages visited</li>
                <li>Approximate location (based on IP)</li>
                <li>Browser and device type</li>
                <li>Time spent on site</li>
                <li>Referring site or search term</li>
              </ul>
              <p className="mb-6">
                All of this data is <strong>anonymous</strong> and used only for aggregate insights.
              </p>
              
              <h3 className="text-xl font-serif font-semibold mt-6 mb-3 text-charcoal dark:text-white">
                b. Google AdSense
              </h3>
              <p className="mb-4">
                We display non-intrusive ads through Google AdSense. These ads help support our work. Google may use cookies and device identifiers to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Show ads relevant to your interests</li>
                <li>Limit ad frequency</li>
                <li>Measure ad performance</li>
              </ul>
              <p className="mb-6">
                You can control your ad settings through <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue hover:text-red transition-colors">Google's Ads Settings</a> or opt out through browser-based ad blockers.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                3. Cookies
              </h2>
              <p className="mb-4">
                Cookies are small data files stored by your browser. This site uses cookies to enable:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Analytics (via Google Analytics)</li>
                <li>Advertising (via Google AdSense)</li>
                <li>Session performance enhancements (e.g., page caching)</li>
              </ul>
              <p className="mb-6">
                You can manage or disable cookies in your browser settings at any time.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                4. External Tools and Recommendations
              </h2>
              <p className="mb-4">
                We sometimes recommend external tools (e.g., drug interaction checkers) to help visitors take action.
              </p>
              <p className="mb-4">
                One such tool is <strong>VitaCheck</strong>, a modern medication and supplement interaction checker. We reference it in our "Tools" section as an example of best practices — but:
              </p>
              <blockquote className="border-l-4 border-blue pl-4 py-2 my-6 italic bg-blue/5 dark:bg-blue/10 rounded">
                <p className="mb-2"><strong>We are not affiliated with VitaCheck or any other third-party tool.</strong></p>
                <p>Any information you enter on external sites is subject to their own privacy policies and terms of use.</p>
              </blockquote>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                5. No Medical Advice
              </h2>
              <p className="mb-6">
                All information on this site is for <strong>educational and awareness purposes only</strong>. We do not offer medical advice, and no content should be interpreted as a substitute for consultation with a licensed healthcare provider.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                6. Data Security
              </h2>
              <p className="mb-4">
                We do not store or process personal data on our servers. Any third-party services we use (e.g., Google) follow industry-standard security practices.
              </p>
              <p className="mb-6">
                If this policy changes and we introduce account features, forms, or login functionality in the future, we will update this section to reflect new safeguards.
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                7. Your Rights and Choices
              </h2>
              <p className="mb-4">
                While we do not store personal data, you have the right to:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Opt out of analytics via the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue hover:text-red transition-colors">Google Analytics Opt-Out Tool</a></li>
                <li>Manage or block cookies in your browser</li>
                <li>Use an ad blocker if you prefer a no-ad experience</li>
              </ul>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                8. Contact
              </h2>
              <p className="mb-6">
                If you have questions about this Privacy Policy or anything related to data use, email us at:
                <br /><br />
                <strong>admin@medsafeproject.org</strong>
              </p>
              
              <h2 className="text-2xl font-serif font-semibold mt-10 mb-4 text-charcoal dark:text-white">
                9. Updates to This Policy
              </h2>
              <p className="mb-6">
                We may update this Privacy Policy as needed to reflect changes in the project, tools used, or legal requirements. The "Last Updated" date at the top will always reflect the most recent revision.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
