
import { Link } from "react-router-dom";
import { ExternalLink, Mail } from "lucide-react";
import { scrollToTop } from "@/utils/scrollUtils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Custom link click handler for internal links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    
    // Skip for external links (containing http or mailto)
    if (href && (href.includes('http') || href.includes('mailto:'))) return;
    
    // Skip for anchor links
    if (href && href.includes('#') && href !== '#') return;
    
    // Otherwise scroll to top
    scrollToTop();
  };

  return (
    <footer className="bg-white dark:bg-charcoal border-t border-gray-200 dark:border-gray-800">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4" onClick={handleLinkClick}>
              <div className="bg-red rounded-md w-8 h-8 flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <span className="font-serif text-xl font-semibold text-charcoal dark:text-white">
                MedSafe Project
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Raising awareness about medication safety and educating the public on adverse drug interactions.
            </p>
            <div className="flex items-center space-x-4">
              <a href="mailto:admin@medsafeproject.org" className="text-blue hover:text-red transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-serif font-semibold text-lg mb-4 text-charcoal dark:text-white">Site Map</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors" onClick={handleLinkClick}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors" onClick={handleLinkClick}>
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors" onClick={handleLinkClick}>
                  Tools
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors" onClick={handleLinkClick}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors" onClick={handleLinkClick}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-serif font-semibold text-lg mb-4 text-charcoal dark:text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.fda.gov/drugs/drug-safety-and-availability" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors flex items-center">
                  FDA Drug Safety
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://www.cdc.gov/medicationsafety" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors flex items-center">
                  CDC Medication Safety
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://www.who.int/campaigns/medication-without-harm" className="text-gray-600 dark:text-gray-400 hover:text-red dark:hover:text-red transition-colors flex items-center">
                  WHO Medication Safety
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-serif font-semibold text-lg mb-4 text-charcoal dark:text-white">Disclaimer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The MedSafe Project provides educational information only and is not a substitute for professional medical advice. Always consult your healthcare provider.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {currentYear} MedSafe Project. All rights reserved.</p>
          <p className="mt-2">A public health initiative dedicated to medication safety awareness.</p>
        </div>
      </div>
    </footer>
  );
}
