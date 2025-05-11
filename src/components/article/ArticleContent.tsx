
import { ScrollReveal } from "@/components/ScrollReveal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleContentProps {
  fullText: string;
  pullQuote?: string;
}

export function ArticleContent({ fullText, pullQuote }: ArticleContentProps) {
  return (
    <ScrollReveal>
      <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-serif font-semibold mb-4 mt-8 text-charcoal dark:text-white" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-serif font-semibold mb-3 mt-6 text-charcoal dark:text-white" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-serif font-semibold mb-3 mt-5 text-charcoal dark:text-white" {...props} />,
            p: ({node, ...props}) => <p className="mb-6 text-gray-800 dark:text-gray-200" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6" {...props} />,
            li: ({node, ...props}) => <li className="mb-2" {...props} />,
            a: ({node, ...props}) => <a className="text-blue hover:text-red transition-colors underline" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue pl-6 my-8 italic text-xl font-serif text-charcoal dark:text-white" {...props} />
          }}
        >
          {fullText}
        </ReactMarkdown>
        
        {pullQuote && (
          <blockquote className="border-l-4 border-blue pl-6 my-8 italic text-xl font-serif text-charcoal dark:text-white">
            {pullQuote}
          </blockquote>
        )}
      </div>
    </ScrollReveal>
  );
}
