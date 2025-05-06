import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BookOpen, Info, AlertTriangle, ShieldCheck, Pill, PlusCircle, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToTop } from "@/utils/scrollUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export const HeroSection = () => {
  const isMobile = useIsMobile();
  const [scrollY, setScrollY] = useState(0);
  
  // Add subtle parallax effect based on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    
    // If it's an anchor link (contains #), let the default behavior handle it
    if (href && href.includes('#') && href !== '#') return;
    
    // Otherwise scroll to top
    scrollToTop();
  };

  return (
    <section className="relative bg-gradient-to-br from-white to-blue-50 dark:from-blue/10 dark:to-charcoal/70 py-20 min-h-[90vh] flex items-center overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-blue/5 dark:bg-blue/10"
             style={{ transform: `translate3d(${scrollY * 0.03}px, 0, 0)` }}></div>
        <div className="absolute bottom-20 left-[5%] w-64 h-64 rounded-full bg-red/5 dark:bg-red/10"
             style={{ transform: `translate3d(0, ${scrollY * -0.02}px, 0)` }}></div>
        <div className="absolute top-[30%] left-[15%] w-40 h-40 rounded-full bg-blue/5 dark:bg-blue/10"
             style={{ transform: `translate3d(${scrollY * -0.04}px, 0, 0)` }}></div>
             
        {/* Removed flashing pill icons */}
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAEsklEQVRoge2aTW8bRRjHf8/srtex4zghKU0IaQJtCYKCoEK8I+AD8AXKC+JDcOSO1ApxquDEpRz4AhUXhMShCCgoLQoqaSPcxI5j75q/h13bsXftjRsH5KJ50Gg0M9qZ5zfPPDOzs+CZglEv7r/1UN7YIXlHKoPnjXYGA/yXce7MOXM2/6yKzLbMmMliTPrKSUAkPXTPDGZYJBLexqf/1l+uun6BbPRgiYC2LkfGQyRvKw/m1qXFM/9mQheAT0Z6ceePgOPN9UQytV6RtLwYRyg3Ljx0T38j/y6ZcPiZHxOKiFkvvdXXZhz1zzNyxFEf+SGmSWojuh6QdkiS9qPP9jNQJTZCxKjYqpGk/hYu9fcLvt8vDVQlRfJTYqpI3yORKhGTkKpFTtKZOJKSURXJE5CkY1rqHlMVUD0S3S0SjMKHKhLDyQTqUgVOVUWlKpOqyKhwWpKQepyJ7Ug/0iJVGUkHorQ9EmMk6rxfmiJJ1EWC8YwsItEJncJYISMFQ5EYaeIF4pBKTOtQlEhGTfKEeFwgkiaadExjNSVy4qhK9HEmvk+nC4wq0qsjHSyBjJGqSClRpfpCpYqExjEsaZIsinQVSVOkJJnJAUnGmIJEHymVdBQZNKXGDkhjTqnxAqFARr4LphB3h44bkM6EylUwbSAjy4RXkmEy8QOS/IB0+k9JPR25tsQiEllMSkmy44U5TvECE7e4p5OJ75AUIW6ApEoMFwkupAFJPflwzxCRkF1guIi6Pql5orJBEi8QFRizuI9XwIxZ3DsP9+AhngzouEGRGemRKAFxhXg1Odpwj8SJrCahIr2HqibWCT3+54AjnSap5IdkJWPTakBqrCZJBcYv7oPDnG6YdS2axCIO8UWkCYTTKwyKzEh1nMMhqWsvKHaleuofB4eTySj0JazUPZY3j/jv4BgFnjOGN88VuVgu4C5kzhPiRKWoPesGPmUxev/0XCb4qREwpFE3bHJzs8a93ToBdhDEDQK+3Kpzc7MWfKmfMkGQmU6pZEQUFVlbzPHRm+dZW8whIkzkCvzwoM7X9/cCCVBlvdLkjxseogaqiocrEtLheaPA5c8Jl9sVrpSX+Gjtee5UXW5XD8gbsb6lFZg+VcLpZZzinhK+GiNikeZ3UKDeMqzv1jlsKotZw+LUJBXXd/JWkMeONIQ3Sg430pYiI6J0sosAWeOjwL93j3h/Y4+hmGgiQdDad1nMGH788Sqtw533N6Al6KGPN/cpZjPUnz9Hod7E9HnzJ60SqoqnBgNUM4biBRcTswOZJTw1bGzX+O6va5xZbfL3wwzndqoUmp7fOHJGPKO8evlFXMdhoVjgyuUqUi3jiy82bg+YEUVoScBn9w95a7lI7sJC8GT6Zg4/AaK8/fpZvvmuzmv1JdrrZ3i3WgFZot0x6GQ64p0pSiUR3t/Y542XzuKcO9s58qEzFvRrJ9lYKLLkOJxbKgGgbQlppWfqa5FEJDDRZ4vn34NhZ9wihGFGZsJheNxoL5GQ9ubR3z41yI/bi1QDnGkfOzt0sP3n2LdKljfEkaMdAnHu9Dbuu1rfPuBzZy9n9lN+DxcBTNmw8PSSKuDZf9n8HwoZS3TFpgHWAAAAAElFTkSuQmCC')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>
      </div>
      
      <div className="container-custom relative z-10 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left content - Text and CTA */}
          <ScrollReveal className="text-left">
            <span className="inline-block px-4 py-2 rounded-full bg-blue/10 text-blue font-medium text-sm mb-4 dark:bg-blue/20 dark:text-white">
              Substance Interaction Awareness
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-charcoal dark:text-white leading-tight animate-hero-fade-in">
              {isMobile ? (
                <>
                  <div>One Mistake.</div>
                  <div>One Pill.</div>
                  <div className="text-blue dark:text-blue-100">One Life</div>
                  <div className="text-blue dark:text-blue-100">Changed Forever.</div>
                </>
              ) : (
                <>
                  One Mistake. One Pill. 
                  <span className="text-blue dark:text-blue-100"> One Life Changed Forever.</span>
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl max-w-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
              Millions are <span className="font-bold text-blue">harmed</span> each year by <span className="font-bold text-blue">preventable</span> drug interactions. <span className="font-bold text-blue">It's time for change.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/articles" onClick={handleLinkClick}>
                <Button className="bg-blue hover:bg-blue/90 text-white font-medium transition-all shadow-md hover:shadow-lg px-6 py-3 rounded-lg">
                  See the Top 10 Dangerous Drug Combos
                  <AlertTriangle className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/tools" onClick={handleLinkClick}>
                <Button variant="outline" className="border-blue text-blue hover:bg-blue/10 font-medium transition-all px-6 py-3 rounded-lg dark:border-white/30 dark:text-white dark:hover:bg-blue/20">
                  How Safe Are Your Meds? Find Out
                  <ShieldCheck className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Right content - Image with enhanced visual appeal */}
          <ScrollReveal delay={200} className="hidden lg:flex justify-end">
            <div className="relative">
              {/* Add subtle glow effect behind the image */}
              <div className="absolute -top-5 -left-5 w-full h-full bg-blue/10 rounded-2xl dark:bg-blue/5 animate-pulse" style={{ animationDuration: '3s' }}></div>
              <img 
                src="/lovable-uploads/15fc01fb-7936-49ac-a0ee-ddea34c0d484.png" 
                alt="Close-up of hands holding colorful pills and capsules" 
                className="w-full max-w-md rounded-2xl shadow-lg object-cover relative z-10 animate-fade-in"
              />
              <div className="absolute -bottom-4 right-4 bg-white dark:bg-charcoal/70 shadow-lg rounded-lg p-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Trusted Information</span>
                </div>
              </div>
              {/* Add subtle floating element near the image */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red/20 dark:bg-red/30 animate-pulse" 
                  style={{ animationDuration: '4s' }}></div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Mobile image (shown only on mobile) with enhanced visuals */}
      <div className="container-custom relative z-10 mt-10 lg:hidden">
        <ScrollReveal delay={200} className="flex justify-center">
          <div className="relative max-w-sm mx-auto">
            {/* Add subtle glow effect behind the image */}
            <div className="absolute -top-3 -left-3 w-full h-full bg-blue/10 rounded-2xl dark:bg-blue/5 animate-pulse" style={{ animationDuration: '3s' }}></div>
            <img 
              src={isMobile ? "/lovable-uploads/8a40a1dd-9e4e-49b6-a9ab-5f4088d64ade.png" : "/lovable-uploads/15fc01fb-7936-49ac-a0ee-ddea34c0d484.png"} 
              alt={isMobile ? "Close-up of hands holding green capsules." : "Close-up of hands holding colorful pills and capsules"}
              className="w-full rounded-2xl shadow-lg object-cover relative z-10 max-h-[300px] sm:max-h-[400px] md:max-h-[250px] lg:max-h-none"
            />
            {/* Add subtle floating element near the mobile image */}
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-blue/20 dark:bg-blue/30 animate-pulse"
                style={{ animationDuration: '4s' }}></div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
