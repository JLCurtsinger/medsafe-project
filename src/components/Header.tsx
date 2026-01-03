
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { scrollToTop } from "@/utils/scrollUtils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to handle scroll to top on route change, but only if no hash is present
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Custom link click handler that scrolls to top unless there's a hash in the URL
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    
    // If it's an anchor link (contains #), let the default behavior handle it
    if (href && href.includes('#') && href !== '#') return;
    
    // Otherwise scroll to top and close mobile menu if open
    scrollToTop(closeMobileMenu);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 dark:bg-charcoal/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
          onClick={handleLinkClick}
        >
          <div className="bg-red rounded-md w-8 h-8 flex items-center justify-center text-white font-bold text-lg">M</div>
          <span className={`font-serif text-xl font-semibold ${isScrolled ? "text-charcoal dark:text-white" : "text-charcoal dark:text-white"}`}>
            MedSafe Project
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}
            onClick={handleLinkClick}
          >
            Home
          </Link>
          <Link 
            to="/articles" 
            className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}
            onClick={handleLinkClick}
          >
            Articles
          </Link>
          <Link 
            to="/podcasts" 
            className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}
            onClick={handleLinkClick}
          >
            Podcasts
          </Link>
          <Link 
            to="/tools" 
            className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}
            onClick={handleLinkClick}
          >
            Tools
          </Link>
          <Link 
            to="/data" 
            className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}
            onClick={handleLinkClick}
          >
            Data
          </Link>
          <Link 
            to="/about" 
            className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}
            onClick={handleLinkClick}
          >
            About
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Controls */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-charcoal dark:text-white" />
            ) : (
              <Menu className="h-6 w-6 text-charcoal dark:text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Enhanced with frosted glass effect and animations */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-20 bg-transparent">
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-4 right-4" 
            onClick={closeMobileMenu}
            aria-label="Close Menu"
          >
            <X className="h-6 w-6 text-charcoal dark:text-white" />
          </Button>
          
          {/* Frosted glass navigation panel */}
          <nav className="flex flex-col items-center space-y-6 p-8 mx-4 rounded-xl 
            bg-white/90 dark:bg-charcoal/90 backdrop-blur-lg 
            shadow-lg border border-white/20 dark:border-white/10
            animate-fade-in">
            <Link
              to="/"
              className="text-xl font-medium text-charcoal dark:text-white hover:text-red dark:hover:text-red 
                transition-colors relative group focus:outline-none focus:ring-2 focus:ring-red/70 rounded-md px-2"
              onClick={handleLinkClick}
            >
              Home
              <span className="absolute h-0.5 w-0 bg-red bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/articles"
              className="text-xl font-medium text-charcoal dark:text-white hover:text-red dark:hover:text-red 
                transition-colors relative group focus:outline-none focus:ring-2 focus:ring-red/70 rounded-md px-2"
              onClick={handleLinkClick}
            >
              Articles
              <span className="absolute h-0.5 w-0 bg-red bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/podcasts"
              className="text-xl font-medium text-charcoal dark:text-white hover:text-red dark:hover:text-red 
                transition-colors relative group focus:outline-none focus:ring-2 focus:ring-red/70 rounded-md px-2"
              onClick={handleLinkClick}
            >
              Podcasts
              <span className="absolute h-0.5 w-0 bg-red bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/tools"
              className="text-xl font-medium text-charcoal dark:text-white hover:text-red dark:hover:text-red 
                transition-colors relative group focus:outline-none focus:ring-2 focus:ring-red/70 rounded-md px-2"
              onClick={handleLinkClick}
            >
              Tools
              <span className="absolute h-0.5 w-0 bg-red bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/data"
              className="text-xl font-medium text-charcoal dark:text-white hover:text-red dark:hover:text-red 
                transition-colors relative group focus:outline-none focus:ring-2 focus:ring-red/70 rounded-md px-2"
              onClick={handleLinkClick}
            >
              Data
              <span className="absolute h-0.5 w-0 bg-red bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/about"
              className="text-xl font-medium text-charcoal dark:text-white hover:text-red dark:hover:text-red 
                transition-colors relative group focus:outline-none focus:ring-2 focus:ring-red/70 rounded-md px-2"
              onClick={handleLinkClick}
            >
              About
              <span className="absolute h-0.5 w-0 bg-red bottom-0 left-0 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
