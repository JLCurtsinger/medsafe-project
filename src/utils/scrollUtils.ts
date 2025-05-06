
/**
 * Utility function to scroll to the top of the page
 * @param closeMenu Optional callback to close mobile menu if open
 */
export const scrollToTop = (closeMenu?: () => void) => {
  // Check if the URL has a hash, if so, let the browser handle the anchor scroll
  if (window.location.hash) return;
  
  // Scroll to top with smooth behavior
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  // Execute callback if provided (e.g., to close mobile menu)
  if (closeMenu) closeMenu();
};

/**
 * Utility hook for creating a "Back to Top" button
 * @returns Object containing showButton state
 */
export const useScrollToTop = () => {
  const [showButton, setShowButton] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down 300px
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return { showButton };
};
