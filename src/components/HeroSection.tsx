
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-white to-blue-50 dark:from-blue/10 dark:to-charcoal/70 py-20 min-h-[90vh] flex items-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-blue/5 dark:bg-blue/10"></div>
        <div className="absolute bottom-20 left-[5%] w-64 h-64 rounded-full bg-red/5 dark:bg-red/10"></div>
        <div className="absolute top-[30%] left-[15%] w-40 h-40 rounded-full bg-blue/5 dark:bg-blue/10"></div>
      </div>
      
      <div className="container-custom relative z-10 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left content - Text and CTA */}
          <ScrollReveal className="text-left">
            <span className="inline-block px-4 py-2 rounded-full bg-blue/10 text-blue font-medium text-sm mb-4 dark:bg-blue/20 dark:text-white">
              Medication Safety Initiative
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-charcoal dark:text-white leading-tight animate-fade-in">
              Medication Safety 
              <span className="text-blue dark:text-blue-100"> Matters</span>
            </h1>
            <p className="text-lg md:text-xl max-w-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
              Adverse drug interactions affect millions of people each year. Join us in raising awareness about this preventable healthcare crisis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/articles">
                <Button className="bg-blue hover:bg-blue/90 text-white font-medium transition-all shadow-md hover:shadow-lg px-6 py-3 rounded-lg">
                  Read Our Articles
                  <BookOpen className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-blue text-blue hover:bg-blue/10 font-medium transition-all px-6 py-3 rounded-lg dark:border-white/30 dark:text-white dark:hover:bg-blue/20">
                  Learn About Us
                  <Info className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Right content - Image */}
          <ScrollReveal delay={200} className="hidden lg:flex justify-end">
            <div className="relative">
              <div className="absolute -top-5 -left-5 w-full h-full bg-blue/10 rounded-2xl dark:bg-blue/5"></div>
              <img 
                src="/lovable-uploads/2ca3a21d-7b9c-44d6-879b-0f27aaec8b7c.png" 
                alt="Healthcare professional" 
                className="w-full max-w-md rounded-2xl shadow-lg object-cover relative z-10 animate-fade-in"
              />
              <div className="absolute -bottom-4 right-4 bg-white dark:bg-charcoal/70 shadow-lg rounded-lg p-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Trusted Information</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Mobile image (shown only on mobile) */}
      <div className="container-custom relative z-10 mt-10 lg:hidden">
        <ScrollReveal delay={200} className="flex justify-center">
          <div className="relative max-w-sm mx-auto">
            <div className="absolute -top-3 -left-3 w-full h-full bg-blue/10 rounded-2xl dark:bg-blue/5"></div>
            <img 
              src="/lovable-uploads/2ca3a21d-7b9c-44d6-879b-0f27aaec8b7c.png" 
              alt="Healthcare professional" 
              className="w-full rounded-2xl shadow-lg object-cover relative z-10"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
