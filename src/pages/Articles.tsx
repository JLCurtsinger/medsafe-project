import { useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleCard } from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { articles } from "@/data/articles";
import { SEO } from "@/components/SEO";

const categories = ["All", "Research", "Patient Stories", "Prevention", "News"];

export default function Articles() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(
    (article) =>
      (activeCategory === "All" || article.category === activeCategory) &&
      (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const articlesSchemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": articles.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${window.location.origin}/article/${article.slug}`,
        "name": article.title
      }))
    }
  };

  return (
    <>
      <SEO 
        title="Articles & Resources on Medication Safety | MedSafe Project"
        description="Explore our collection of medication safety articles, research summaries, and patient stories to help prevent adverse drug interactions."
        keywords={["medication safety", "drug interactions", "patient stories", "healthcare research", "adverse reactions"]}
        schemaData={articlesSchemaData}
      />
      
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container-custom">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                Articles & Resources
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Explore our collection of articles, research summaries, and patient stories about medication safety.
              </p>
            </div>
          </ScrollReveal>

          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="overflow-x-auto pb-2">
                <div className="flex space-x-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? "default" : "outline"}
                      className={activeCategory === category ? "bg-blue text-white" : ""}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-charcoal/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <ScrollReveal key={article.id} delay={index * 100}>
                  <ArticleCard {...article} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try changing your search terms or filter selection.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
