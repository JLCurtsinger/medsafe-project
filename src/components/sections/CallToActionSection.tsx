
import { ScrollReveal } from "@/components/ScrollReveal";
import { Share2, BookOpen, Facebook, Twitter, Linkedin, Copy, ExternalLink } from "lucide-react"; // Added Facebook, Twitter, Linkedin, Copy, ExternalLink
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { shareContent, shareSite } from "@/utils/shareUtils";
import { toast } from "sonner"; // For "Link copied!" notification

// Lucide doesn't have a Reddit icon by default in the main package.
// We'll use ExternalLink as a placeholder or you can add a custom SVG for Reddit.
// For this implementation, we'll use a generic link icon for Reddit.
// If you have a specific 'Reddit' icon component, you can replace `ExternalLink` below.
const RedditIcon = ExternalLink; 


export const CallToActionSection = () => {
  const siteUrl = "https://www.medsafeproject.org";
  const siteTitle = "MedSafe Project - Join the Movement for Medication Safety";
  const shareMessage = "Help us raise awareness about medication safety. Share MedSafe Project resources and be part of the solution: " + siteUrl;


  const handleCopyLink = () => {
    navigator.clipboard.writeText(siteUrl)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
        toast.error("Failed to copy link.");
      });
  };

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-blue hover:bg-white/90">
                    Share This Site
                    <Share2 className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 bg-white dark:bg-charcoal">
                  <DropdownMenuItem onClick={() => shareContent('facebook', siteUrl, siteTitle)} className="text-charcoal dark:text-white hover:!bg-gray-100 dark:hover:!bg-gray-700">
                    <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />
                    <span>Facebook</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareContent('twitter', siteUrl, shareMessage)} className="text-charcoal dark:text-white hover:!bg-gray-100 dark:hover:!bg-gray-700">
                    <Twitter className="mr-2 h-4 w-4 text-[#1DA1F2]" />
                    <span>Twitter / X</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareContent('linkedin', siteUrl, siteTitle)} className="text-charcoal dark:text-white hover:!bg-gray-100 dark:hover:!bg-gray-700">
                    <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" />
                    <span>LinkedIn</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareContent('reddit', siteUrl, siteTitle)} className="text-charcoal dark:text-white hover:!bg-gray-100 dark:hover:!bg-gray-700">
                    <RedditIcon className="mr-2 h-4 w-4 text-[#FF4500]" /> {/* Using placeholder RedditIcon */}
                    <span>Reddit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                  <DropdownMenuItem onClick={handleCopyLink} className="text-charcoal dark:text-white hover:!bg-gray-100 dark:hover:!bg-gray-700">
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareSite} className="text-charcoal dark:text-white hover:!bg-gray-100 dark:hover:!bg-gray-700">
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>More Options...</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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

