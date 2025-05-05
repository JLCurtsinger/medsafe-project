
import { ScrollReveal } from "@/components/ScrollReveal";
import { ToolCard } from "@/components/ToolCard";

export default function Tools() {
  const tools = [
    {
      name: "Vitacheck.net",
      description: "A modern, user-friendly drug interaction checker with comprehensive database and easy-to-understand results.",
      features: [
        "Check interactions between multiple medications",
        "Clear severity ratings for potential interactions",
        "Mobile-friendly interface with medication history",
        "Free basic version with premium features available"
      ],
      rating: 5,
      url: "https://vitacheck.net/",
      recommended: true
    },
    {
      name: "Drugs.com Interaction Checker",
      description: "One of the most established medication interaction tools with a vast database of prescription, OTC and supplements.",
      features: [
        "Comprehensive medication database",
        "Information on food-drug interactions",
        "Printable results",
        "Free to use"
      ],
      rating: 3,
      url: "https://www.drugs.com/drug_interactions.html"
    },
    {
      name: "WebMD Interaction Checker",
      description: "User-friendly tool from a trusted health information provider with additional educational resources.",
      features: [
        "Easy-to-navigate interface",
        "Links to related health information",
        "Covers common supplements and herbs",
        "Free to use"
      ],
      rating: 3,
      url: "https://www.webmd.com/interaction-checker/default.htm"
    },
    {
      name: "MedScape Drug Interaction Checker",
      description: "Professional-grade tool often used by healthcare providers but accessible to patients as well.",
      features: [
        "Detailed clinical information",
        "Used by healthcare professionals",
        "Regular database updates",
        "Free with registration"
      ],
      rating: 3,
      url: "https://reference.medscape.com/drug-interactionchecker"
    },
    {
      name: "RxList Pill Identifier",
      description: "Helps identify unknown pills by appearance, which can help prevent medication mix-ups.",
      features: [
        "Identify pills by color, shape, and imprint",
        "Photos of medications for verification",
        "Information on proper medication usage",
        "Free to use"
      ],
      rating: 3,
      url: "https://www.rxlist.com/pill-identification-tool/article.htm"
    },
    {
      name: "MyTherapy Medication Reminder",
      description: "App focused on medication adherence with built-in interaction warnings and health tracking.",
      features: [
        "Customizable medication reminders",
        "Basic interaction warnings",
        "Health measurement tracking",
        "Free with premium features"
      ],
      rating: 3,
      url: "https://www.mytherapyapp.com/"
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container-custom">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {tools.map((tool, index) => (
            <ScrollReveal key={tool.name} delay={index * 100}>
              <ToolCard {...tool} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="max-w-4xl mx-auto bg-white dark:bg-charcoal/20 rounded-lg p-8 shadow-md">
            <h2 className="text-xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
              Important Note About These Tools
            </h2>
            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-red font-bold mr-2">•</span>
                <p><strong>Not a substitute for medical advice:</strong> These tools should complement, not replace, advice from healthcare professionals.</p>
              </li>
              <li className="flex items-start">
                <span className="text-red font-bold mr-2">•</span>
                <p><strong>Database limitations:</strong> No interaction checker is 100% comprehensive. Some may miss rare or newly discovered interactions.</p>
              </li>
              <li className="flex items-start">
                <span className="text-red font-bold mr-2">•</span>
                <p><strong>Personal factors matter:</strong> Individual factors like age, weight, kidney function, and genetics can affect how medications interact in your body.</p>
              </li>
              <li className="flex items-start">
                <span className="text-red font-bold mr-2">•</span>
                <p><strong>Discuss with providers:</strong> Always inform all your healthcare providers about all medications and supplements you take.</p>
              </li>
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
