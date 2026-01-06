
import { ScrollReveal } from "@/components/ScrollReveal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleContentProps {
  fullText: string;
  pullQuote?: string;
}

export function ArticleContent({ fullText, pullQuote }: ArticleContentProps) {
  // Ensure fullText is provided
  if (!fullText) {
    return (
      <div className="max-w-4xl mx-auto mb-12">
        <p className="text-gray-600 dark:text-gray-400">Article content is not available.</p>
      </div>
    );
  }

  return (
    <ScrollReveal>
      <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-serif font-semibold mb-4 mt-8 text-charcoal dark:text-white" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-serif font-semibold mb-3 mt-6 text-charcoal dark:text-white" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-serif font-semibold mb-3 mt-5 text-charcoal dark:text-white" {...props} />,
            p: ({node, ...props}) => <p className="mb-6 text-gray-800 dark:text-gray-200 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />,
            li: ({node, ...props}) => <li className="mb-2 text-gray-800 dark:text-gray-200" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-charcoal dark:text-white" {...props} />,
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
      </article>
    </ScrollReveal>
  );
}
