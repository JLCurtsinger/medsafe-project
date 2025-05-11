
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { articles } from "@/data/articles";
import { NotFound } from "./NotFound";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleImage } from "@/components/article/ArticleImage";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ShareSection } from "@/components/article/ShareSection";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { ArticleMeta } from "@/components/article/ArticleMeta";

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
      <ArticleMeta 
        title={article.title}
        description={metaDescription}
        articleUrl={articleUrl}
        image={article.image}
        date={article.date}
        category={article.category}
        schema={articleSchema}
      />
      
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <ArticleHeader 
              title={article.title}
              date={article.date}
              readingTime={article.readingTime}
              category={article.category}
            />
            
            <ArticleImage src={article.image} alt={article.title} />
            
            <ArticleContent 
              fullText={article.fullText}
              pullQuote={article.pullQuote}
            />
            
            <ShareSection articleUrl={articleUrl} title={article.title} />
            
            <RelatedArticles articles={relatedArticles} />
          </div>
        </div>
      </div>
    </>
  );
}
