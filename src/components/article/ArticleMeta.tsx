
import { Helmet } from "react-helmet-async";

interface ArticleMetaProps {
  title: string;
  description: string;
  articleUrl: string;
  image: string;
  date: string;
  category: string;
  schema: any;
}

export function ArticleMeta({
  title,
  description,
  articleUrl,
  image,
  date,
  category,
  schema
}: ArticleMetaProps) {
  return (
    <Helmet>
      <title>{title} | MedSafe Project</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={articleUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={articleUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="article:published_time" content={date} />
      <meta property="article:section" content={category} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={articleUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
