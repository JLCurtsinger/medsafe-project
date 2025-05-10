
import { ScrollReveal } from "@/components/ScrollReveal";

export function ToolsIntro() {
  return (
    <>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
            Recommended Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            These online resources can help you check for potential drug interactions and manage your medications safely.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="bg-blue/5 dark:bg-blue/10 rounded-lg p-8 mb-16">
          <h2 className="text-xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
            Why Use Medication Interaction Tools?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Drug interaction checkers can help identify potential problems between prescription medications, over-the-counter drugs, supplements, and even food. While these tools do not replace professional medical advice, they can serve as an important first step in identifying possible risks.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We recommend using these tools before starting new medications and discussing any concerns with your healthcare provider.
          </p>
        </div>
      </ScrollReveal>
    </>
  );
}
