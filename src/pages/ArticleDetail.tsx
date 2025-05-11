
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CalendarIcon, Clock, Share2, ChevronLeft, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { articles } from "@/data/articles";
import { NotFound } from "./NotFound";
import { shareContent } from "@/utils/shareUtils";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  // Current article URL for sharing
  const articleUrl = `${window.location.origin}/article/${article.slug}`;
  
  // Extract first 160 characters of article for meta description
  const metaDescription = article.fullText.substring(0, 157) + "...";
  
  // Generate structured data for article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "image": article.image,
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Organization",
      "name": "MedSafe Project"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MedSafe Project",
      "logo": {
        "@type": "ImageObject",
        "url": "https://medsafeproject.org/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "description": metaDescription,
    "keywords": [article.category, "medication safety", "drug interactions", "patient safety"]
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | MedSafe Project</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={articleUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={article.image} />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:section" content={article.category} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={articleUrl} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={article.image} />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>
      
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
                {/* Replace the paragraph mapping with ReactMarkdown */}
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-serif font-semibold mb-6 mt-8" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-serif font-semibold mb-4 mt-8" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-serif font-semibold mb-3 mt-6" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-lg font-serif font-semibold mb-2 mt-4" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-6 text-gray-800 dark:text-gray-200" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue hover:text-red transition-colors" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-blue pl-6 my-8 italic text-xl font-serif text-charcoal dark:text-white" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto mb-6" {...props} />
                    ),
                  }}
                >
                  {article.fullText}
                </ReactMarkdown>
                
                {article.pullQuote && (
                  <blockquote className="border-l-4 border-blue pl-6 my-8 italic text-xl font-serif text-charcoal dark:text-white">
                    {article.pullQuote}
                  </blockquote>
                )}
                
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Share this article</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => shareContent("facebook", articleUrl, article.title)}
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => shareContent("twitter", articleUrl, article.title)}
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Tweet
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => shareContent("email", articleUrl, `Check out this article: ${article.title}`, 
                          `I thought you might be interested in this article from MedSafe Project:\n\n${article.title}\n${articleUrl}`)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
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
    </>
  );
}
