
export function createToolsSchema(tools: {
  name: string;
  description: string;
  features: string[];
  rating: number;
  url: string;
  recommended?: boolean;
}[]) {
  // Create schema for tools page
  const toolsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": tools.map((tool, index) => ({
      "@type": "SoftwareApplication",
      "position": index + 1,
      "name": tool.name,
      "description": tool.description,
      "applicationCategory": "HealthApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "ratingCount": 1,
        "bestRating": 5,
        "worstRating": 1
      }
    }))
  };
  
  // Schema for FAQ section
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why should I use medication interaction tools?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Drug interaction checkers can help identify potential problems between prescription medications, over-the-counter drugs, supplements, and even food. While these tools do not replace professional medical advice, they can serve as an important first step in identifying possible risks."
        }
      },
      {
        "@type": "Question",
        "name": "Can these tools replace medical advice?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. These tools should complement, not replace, advice from healthcare professionals."
        }
      },
      {
        "@type": "Question",
        "name": "Are these interaction checkers completely comprehensive?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No interaction checker is 100% comprehensive. Some may miss rare or newly discovered interactions."
        }
      }
    ]
  };

  return [toolsSchema, faqSchema];
}
