
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | MedSafe Project";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite dark:bg-charcoal px-4">
      <div className="text-center max-w-md">
        <div className="bg-red text-white text-8xl font-bold rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
          404
        </div>
        <h1 className="text-3xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-blue hover:bg-blue/90 text-white">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
