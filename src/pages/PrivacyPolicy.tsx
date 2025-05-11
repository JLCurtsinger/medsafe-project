
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
              {/* The content will be pasted here later */}
              <p className="text-center text-gray-500 italic">
                Privacy policy content will be added here.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
