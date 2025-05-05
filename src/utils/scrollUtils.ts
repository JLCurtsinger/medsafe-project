
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
