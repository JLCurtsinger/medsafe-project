
import { ScrollReveal } from "@/components/ScrollReveal";
import { ChevronRight, FlaskConical, Smartphone, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const ToolsSection = () => {
  return (
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
            <div className="bg-gradient-to-br from-blue/80 to-[#4a4adf]/70 text-white rounded-lg p-8 flex flex-col h-full shadow-lg hover:scale-105 transition-all duration-300">
              <div className="mb-6 flex items-center">
                <FlaskConical className="w-10 h-10 mr-3 text-white" />
                <h3 className="font-serif text-xl font-semibold text-white">
                  Drug Interaction Checkers
                </h3>
              </div>
              <p className="text-white/90 text-sm mb-6">
                Online tools that allow you to check if your medications interact with each other.
              </p>
              <div className="mt-auto">
                <Link to="/tools" className="inline-flex items-center text-white hover:text-white/80 transition-colors font-medium">
                  <span>Check Your Meds Now</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 flex flex-col h-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-6 flex items-center">
                <Smartphone className="w-10 h-10 mr-3 text-blue dark:text-blue/80" />
                <h3 className="font-serif text-xl font-semibold mb-0 text-charcoal dark:text-white">
                  Medication Management Apps
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Mobile applications that help you keep track of your medications and potential interactions.
              </p>
              <div className="mt-auto">
                <Link to="/tools" className="inline-flex items-center text-blue hover:text-red transition-colors font-medium">
                  <span>Track Medications</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-offwhite dark:bg-charcoal/30 rounded-lg p-8 flex flex-col h-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-6 flex items-center">
                <BookOpen className="w-10 h-10 mr-3 text-blue dark:text-blue/80" />
                <h3 className="font-serif text-xl font-semibold mb-0 text-charcoal dark:text-white">
                  Educational Resources
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Guides and articles to help you understand how to prevent medication errors.
              </p>
              <div className="mt-auto">
                <Link to="/articles" className="inline-flex items-center text-blue hover:text-red transition-colors font-medium">
                  <span>Learn How to Stay Safe</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
