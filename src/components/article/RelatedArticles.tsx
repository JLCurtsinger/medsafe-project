
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";

interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  image: string;
  readingTime: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;
  
  return (
    <ScrollReveal>
      <div className="mt-16">
        <h3 className="text-2xl font-serif font-semibold mb-8 text-charcoal dark:text-white">
          Related Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((related) => (
            <Link
              key={related.id}
              to={`/article/${related.slug}`}
              className="group"
            >
              <div className="aspect-video overflow-hidden rounded-lg mb-3">
                <img
                  src={related.image}
                  alt={related.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h4 className="font-serif font-medium text-lg mb-1 group-hover:text-red transition-colors">
                {related.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {related.readingTime}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
