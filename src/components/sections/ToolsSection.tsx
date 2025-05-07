
import { ScrollReveal } from "@/components/ScrollReveal";
import { ChevronRight } from "lucide-react";
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
  );
};
