
import { ScrollReveal } from "@/components/ScrollReveal";
import { Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { shareSite } from "@/utils/shareUtils";

export const CallToActionSection = () => {
  return (
    <section className="py-20 bg-blue text-white">
      <div className="container-custom">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Join the Movement
            </h2>
            <p className="text-lg mb-8">
              Help us raise awareness about medication safety. Share our resources, join our community, and be part of the solution.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" className="bg-white text-blue hover:bg-white/90" onClick={shareSite}>
                Share This Site
                <Share2 className="ml-2 h-4 w-4" />
              </Button>
              <Link to="/articles">
                <Button variant="outline" className="bg-transparent border-white hover:bg-white/10">
                  Read Our Articles
                  <BookOpen className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
