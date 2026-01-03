import { ScrollReveal } from "@/components/ScrollReveal";
import { SEO } from "@/components/SEO";
import { DataSectionCard } from "@/components/DataSectionCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WordCloudChart } from "@/components/charts/WordCloudChart";
import { SignalsVsExposureChart } from "@/components/charts/SignalsVsExposureChart";

export default function Data() {
  return (
    <>
      <SEO 
        title="Data - Interactive Medication Safety Visualizations | MedSafe Project"
        description="Explore interactive data visualizations to understand medication and supplement risk signals. Educational content only, not medical advice."
        keywords={["medication data", "drug interaction data", "FDA data", "medication safety statistics", "adverse event data"]}
      />
      
      <div className="pt-24 pb-20 min-h-screen 
        bg-gradient-to-b from-background via-background to-gray-50/50 dark:to-charcoal/20">
        <div className="container-custom">
          {/* Hero Section */}
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                Interaction Data
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Interactive visuals to spot patterns in medication and supplement data.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-8 italic">
                For educational use only. 
              </p>
              
              {/* Data Sources Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-xs md:text-sm border-gray-300 dark:border-gray-600 
                    bg-white/50 dark:bg-charcoal/30 text-gray-700 dark:text-gray-300"
                >
                  FDA drug labels (openFDA)
                </Badge>
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-xs md:text-sm border-gray-300 dark:border-gray-600 
                    bg-white/50 dark:bg-charcoal/30 text-gray-700 dark:text-gray-300"
                >
                  Adverse event reports (FAERS)
                </Badge>
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-xs md:text-sm border-gray-300 dark:border-gray-600 
                    bg-white/50 dark:bg-charcoal/30 text-gray-700 dark:text-gray-300"
                >
                  Medication exposure (CMS Part D)
                </Badge>
              </div>
            </div>
          </ScrollReveal>

          {/* Section 1: Interaction language word cloud */}
          <ScrollReveal delay={100}>
            <div className="max-w-5xl mx-auto mb-12">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif mb-2 text-charcoal dark:text-white">
                    Commonly Used Interaction language
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    A visualization of the most common terms and phrases used to describe drug interactions across FDA labeling documents to identify patterns in how interactions are communicated.
                  </p>
                </div>
                <WordCloudChart />
              </div>
            </div>
          </ScrollReveal>

          {/* Section 2: Signals vs exposure */}
          <ScrollReveal delay={200}>
            <div className="max-w-5xl mx-auto mb-12">
              <DataSectionCard
                title="Signals vs exposure"
                description="Compare reported adverse events against medication exposure rates to identify potential safety signals that may warrant further investigation."
                comingSoon={true}
              >
                <SignalsVsExposureChart />
                
                <div className="mt-6 pt-6 border-t border-white/10 dark:border-white/5">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    <strong className="text-charcoal dark:text-white">How to read this:</strong>{" "}
                    Higher bars indicate medications with more reported adverse events relative to their exposure. 
                    This visualization helps identify medications that may have disproportionate safety concerns.
                  </p>
                </div>
              </DataSectionCard>
            </div>
          </ScrollReveal>

          {/* Section 3: Common interaction clusters */}
          <ScrollReveal delay={300}>
            <div className="max-w-5xl mx-auto mb-12">
              <DataSectionCard
                title="Common interaction clusters"
                description="Explore groups of medications that frequently interact together, revealing patterns in polypharmacy risks and common co-prescription scenarios."
                comingSoon={true}
              >
                <div className="h-64 md:h-80 w-full rounded-lg overflow-hidden 
                  bg-gradient-to-br from-gray-100 to-gray-200 dark:from-charcoal/50 dark:to-charcoal/70
                  border border-white/20 dark:border-white/10
                  p-4">
                  {/* Heatmap-like grid placeholder */}
                  <div className="grid grid-cols-8 md:grid-cols-12 gap-1 h-full">
                    {Array.from({ length: 96 }).map((_, i) => (
                      <Skeleton 
                        key={i} 
                        className={`h-full w-full ${
                          i % 12 === 0 || i % 12 === 5 || i % 12 === 8 
                            ? 'opacity-60' 
                            : i % 12 === 2 || i % 12 === 7 || i % 12 === 11
                            ? 'opacity-40'
                            : 'opacity-20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </DataSectionCard>
            </div>
          </ScrollReveal>

          {/* Footer Note */}
          <ScrollReveal delay={400}>
            <div className="max-w-4xl mx-auto mt-16">
              <div className="bg-white/60 dark:bg-charcoal/30 backdrop-blur-sm 
                border border-white/20 dark:border-white/10
                rounded-lg p-6 md:p-8">
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong className="text-charcoal dark:text-white">Note:</strong>{" "}
                  Reported data can be incomplete and biased. Adverse event reports do not establish 
                  causation, and many factors influence reporting rates including medication popularity, 
                  patient demographics, and healthcare provider awareness. These visualizations are 
                  intended for educational purposes and should not be used as the sole basis for 
                  medical decision-making.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}

