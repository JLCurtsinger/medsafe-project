
import { ScrollReveal } from "@/components/ScrollReveal";
import { ToolCard } from "@/components/ToolCard";

interface ToolsGridProps {
  tools: {
    name: string;
    description: string;
    features: string[];
    rating: number;
    url: string;
    recommended?: boolean;
  }[];
}

export function ToolsGrid({ tools }: ToolsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {tools.map((tool, index) => (
        <ScrollReveal key={tool.name} delay={index * 100}>
          <ToolCard {...tool} />
        </ScrollReveal>
      ))}
    </div>
  );
}
