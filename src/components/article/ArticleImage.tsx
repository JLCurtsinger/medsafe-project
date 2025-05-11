
import { ScrollReveal } from "@/components/ScrollReveal";

interface ArticleImageProps {
  src: string;
  alt: string;
}

export function ArticleImage({ src, alt }: ArticleImageProps) {
  return (
    <ScrollReveal>
      <div className="rounded-lg overflow-hidden mb-8">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover"
        />
      </div>
    </ScrollReveal>
  );
}
