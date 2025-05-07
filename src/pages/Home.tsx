
import { ScrollReveal } from "@/components/ScrollReveal";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { RealLivesSection } from "@/components/sections/RealLivesSection";
import { ToolsSection } from "@/components/sections/ToolsSection";
import { CallToActionSection } from "@/components/sections/CallToActionSection";

export default function Home() {
  // Create structured data for homepage
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://medsafeproject.org/",
    "name": "MedSafe Project",
    "description": "Raising awareness about medication safety and preventing adverse drug interactions",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://medsafeproject.org/articles?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  
  return (
    <>
      <SEO 
        title="MedSafe Project - Prevent Adverse Drug Interactions with Smarter Tools" 
        description="Learn how to prevent harmful medication interactions and adverse drug events with reliable tools and education from the MedSafe Project." 
        keywords={["medication safety", "drug interactions", "adverse drug events", "medication tools", "patient safety", "healthcare safety"]} 
        schemaData={homeSchema} 
      />
      
      <div className="pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* The Problem Section */}
        <ProblemSection />
        
        {/* Real Lives Section */}
        <RealLivesSection />

        {/* Tools That Help Section */}
        <ToolsSection />

        {/* Call to Action */}
        <CallToActionSection />
      </div>
    </>
  );
}
