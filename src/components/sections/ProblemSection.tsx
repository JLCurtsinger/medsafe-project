
import { ScrollReveal } from "@/components/ScrollReveal";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ProblemSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-charcoal relative">
      {/* Added subtle visual element for the Problem section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC')] opacity-[0.03] dark:opacity-[0.05]"></div>
        {/* Blurred pill silhouette in the bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue/3 dark:bg-blue/5 blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        {/* Semi-transparent abstract shape */}
        <div className="absolute top-10 left-0 w-80 h-80 bg-red/2 dark:bg-red/3 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/4"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
              The Problem We're Addressing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Adverse drug reactions are a leading cause of preventable harm in healthcare.</p>
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
  );
};
