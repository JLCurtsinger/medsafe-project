import { ScrollReveal } from "@/components/ScrollReveal";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { ExternalLink, ChevronRight, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { shareSite } from "@/utils/shareUtils";
import { SEO } from "@/components/SEO";

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
        {/* ... keep existing code (Home page content) */}
        {/* Hero Section */}
        <HeroSection />

        {/* The Problem Section */}
        <section className="py-20 bg-white dark:bg-charcoal">
          <div className="container-custom">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                  The Problem We're Addressing
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Adverse drug reactions are a leading cause of preventable harm in healthcare.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScrollReveal delay={100}>
                <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 text-center">
                  <div className="text-4xl font-bold text-red mb-4">1.3M</div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Americans are injured by medication errors annually
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 text-center">
                  <div className="text-4xl font-bold text-red mb-4">28%</div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Of adverse drug events are preventable with better information
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 text-center">
                  <div className="text-4xl font-bold text-red mb-4">$528B</div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Annual cost of medication-related problems in the US
                  </p>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={400}>
              <div className="max-w-3xl mx-auto mt-16 text-center">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  Despite these staggering numbers, medication safety awareness remains low. Our mission is to change that through education, awareness, and advocacy.
                </p>
                <Link to="/articles" className="inline-flex items-center text-blue hover:text-red transition-colors">
                  <span className="font-medium">Read more about the issues</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Real Lives Section */}
        <section className="py-20 bg-blue/5 dark:bg-blue/10">
          <div className="container-custom">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                  Real Lives, Real Stories
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Behind every statistic is a person whose life has been affected by medication errors.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <TestimonialSlider />
            </ScrollReveal>
          </div>
        </section>

        {/* Tools That Help Section */}
        <section className="py-20 bg-white dark:bg-charcoal">
          <div className="container-custom">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                  Tools That Help
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Several online resources can help you check for potential drug interactions.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScrollReveal delay={100}>
                <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="font-serif text-xl font-semibold mb-2 text-charcoal dark:text-white">
                      Drug Interaction Checkers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Online tools that allow you to check if your medications interact with each other.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link to="/tools" className="inline-flex items-center text-blue hover:text-red transition-colors">
                      <span className="font-medium">View recommended tools</span>
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="font-serif text-xl font-semibold mb-2 text-charcoal dark:text-white">
                      Medication Management Apps
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Mobile applications that help you keep track of your medications and potential interactions.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link to="/tools" className="inline-flex items-center text-blue hover:text-red transition-colors">
                      <span className="font-medium">Explore apps</span>
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="font-serif text-xl font-semibold mb-2 text-charcoal dark:text-white">
                      Educational Resources
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Guides and articles to help you understand how to prevent medication errors.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link to="/articles" className="inline-flex items-center text-blue hover:text-red transition-colors">
                      <span className="font-medium">Browse resources</span>
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-blue text-white">
          <div className="container-custom">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
                  Join the Movement
                </h2>
                <p className="text-lg mb-8">
                  Help us raise awareness about medication safety. Share our resources, join our community, and be part of the solution.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    variant="outline" 
                    className="bg-white text-blue hover:bg-white/90"
                    onClick={shareSite}
                  >
                    Share This Site
                    <Share2 className="ml-2 h-4 w-4" />
                  </Button>
                  <Link to="/articles">
                    <Button variant="outline" className="bg-transparent border-white hover:bg-white/10">
                      Read Our Articles
                      <BookOpen className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
