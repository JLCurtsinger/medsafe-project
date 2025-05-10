
import { ScrollReveal } from "@/components/ScrollReveal";

export function ToolsFAQ() {
  return (
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
  );
}
