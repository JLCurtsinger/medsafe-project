
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 dark:bg-charcoal/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-red rounded-md w-8 h-8 flex items-center justify-center text-white font-bold text-lg">M</div>
          <span className={`font-serif text-xl font-semibold ${isScrolled ? "text-charcoal dark:text-white" : "text-charcoal dark:text-white"}`}>
            MedSafe Project
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}>
            Home
          </Link>
          <Link to="/articles" className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}>
            Articles
          </Link>
          <Link to="/tools" className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}>
            Tools
          </Link>
          <Link to="/about" className={`font-medium ${isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-charcoal/80 dark:text-white/80"} hover:text-red transition-colors`}>
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-charcoal z-40 pt-20">
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-4 right-4" 
            onClick={closeMobileMenu}
            aria-label="Close Menu"
          >
            <X className="h-6 w-6 text-charcoal dark:text-white" />
          </Button>
          <nav className="flex flex-col items-center space-y-6 p-8">
            <Link
              to="/"
              className="text-xl font-medium text-charcoal dark:text-white"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/articles"
              className="text-xl font-medium text-charcoal dark:text-white"
              onClick={closeMobileMenu}
            >
              Articles
            </Link>
            <Link
              to="/tools"
              className="text-xl font-medium text-charcoal dark:text-white"
              onClick={closeMobileMenu}
            >
              Tools
            </Link>
            <Link
              to="/about"
              className="text-xl font-medium text-charcoal dark:text-white"
              onClick={closeMobileMenu}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
