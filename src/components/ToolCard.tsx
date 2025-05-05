
import { Star } from "lucide-react";

interface ToolCardProps {
  name: string;
  description: string;
  features: string[];
  rating: number;
  url: string;
  recommended?: boolean;
}

export function ToolCard({ name, description, features, rating, url, recommended = false }: ToolCardProps) {
  return (
    <div className={`bg-white dark:bg-charcoal/20 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
      recommended ? "border-2 border-blue" : ""
    }`}>
      {recommended && (
        <div className="bg-blue text-white text-center py-1 text-sm font-medium">
          Recommended
        </div>
      )}
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold mb-2 text-charcoal dark:text-white">{name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
        
        <div className="mb-4 flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
            />
          ))}
        </div>
        
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block text-center py-2 bg-blue text-white rounded-md hover:bg-blue/90 transition-colors"
        >
          Visit Website
        </a>
      </div>
    </div>
  );
}
