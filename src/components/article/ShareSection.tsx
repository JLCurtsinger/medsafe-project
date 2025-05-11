
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Share2 } from "lucide-react";
import { shareContent } from "@/utils/shareUtils";

interface ShareSectionProps {
  articleUrl: string;
  title: string;
}

export function ShareSection({ articleUrl, title }: ShareSectionProps) {
  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div>
        <h4 className="font-semibold text-lg mb-1">Share this article</h4>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => shareContent("facebook", articleUrl, title)}
          >
            <Facebook className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => shareContent("twitter", articleUrl, title)}
          >
            <Twitter className="h-4 w-4 mr-2" />
            Tweet
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => shareContent("email", articleUrl, `Check out this article: ${title}`, 
              `I thought you might be interested in this article from MedSafe Project:\n\n${title}\n${articleUrl}`)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>
      
      <Link to="/articles">
        <Button variant="default" className="bg-blue hover:bg-blue/90">
          Read More Articles
        </Button>
      </Link>
    </div>
  );
}
