
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CalendarIcon, Clock, Share2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { articles } from "@/data/articles";
import { NotFound } from "./NotFound";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  if (!article) {
    return <NotFound />;
  }

  // Find related articles (same category, excluding current article)
  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <Link to="/articles" className="inline-flex items-center text-blue hover:text-red mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back to Articles</span>
            </Link>
            
            <div className="mb-6">
              <span className="tag mb-4">{article.category}</span>
              <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                {article.title}
              </h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
                <div className="flex items-center mr-6">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{article.readingTime}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal>
            <div className="rounded-lg overflow-hidden mb-8">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </ScrollReveal>
          
          <ScrollReveal>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <p>
                {article.fullText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-6 text-gray-800 dark:text-gray-200">
                    {paragraph}
                  </p>
                ))}
              </p>
              
              {article.pullQuote && (
                <blockquote className="border-l-4 border-blue pl-6 my-8 italic text-xl font-serif text-charcoal dark:text-white">
                  {article.pullQuote}
                </blockquote>
              )}
              
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-semibold text-lg mb-1">Share this article</h4>
                  <Button variant="outline" size="sm" className="mr-2">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                <Link to="/articles">
                  <Button variant="default" className="bg-blue hover:bg-blue/90">
                    Read More Articles
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
          
          {relatedArticles.length > 0 && (
            <ScrollReveal>
              <div className="mt-16">
                <h3 className="text-2xl font-serif font-semibold mb-8 text-charcoal dark:text-white">
                  Related Articles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedArticles.map((related) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
