
import { Link } from "react-router-dom";
import { CalendarIcon, Clock } from "lucide-react";

interface ArticleCardProps {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  image: string;
  category: string;
  slug: string;
}

export function ArticleCard({ id, title, excerpt, date, readingTime, image, category, slug }: ArticleCardProps) {
  return (
    <Link to={`/article/${slug}`} className="article-card block group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="tag">{category}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-red transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{readingTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
