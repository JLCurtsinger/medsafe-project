
import { Link } from "react-router-dom";
import { CalendarIcon, Clock, ChevronLeft } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

interface ArticleHeaderProps {
  title: string;
  date: string;
  readingTime: string;
  category: string;
}

export function ArticleHeader({ title, date, readingTime, category }: ArticleHeaderProps) {
  return (
    <ScrollReveal>
      <Link to="/articles" className="inline-flex items-center text-blue hover:text-red mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span>Back to Articles</span>
      </Link>
      
      <div className="mb-6">
        <span className="tag mb-4">{category}</span>
        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
          {title}
        </h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          <div className="flex items-center mr-6">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{readingTime}</span>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
