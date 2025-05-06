
/**
 * Utility functions for sharing content
 */

// Social media sharing URLs
const SHARE_URLS = {
  facebook: "https://www.facebook.com/sharer/sharer.php?u=",
  twitter: "https://twitter.com/intent/tweet?url=",
  linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=",
  email: "mailto:?subject=",
};

/**
 * Opens a share dialog for the specified platform
 * @param platform The platform to share on (facebook, twitter, linkedin, email)
 * @param url The URL to share
 * @param title The title to share (used for email subject and twitter text)
 * @param emailBody Optional body text for email sharing
 */
export const shareContent = (
  platform: "facebook" | "twitter" | "linkedin" | "email",
  url: string,
  title: string,
  emailBody?: string
) => {
  // Get the full absolute URL if a relative URL is provided
  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  
  // Handle different share platforms
  switch (platform) {
    case "facebook":
      window.open(`${SHARE_URLS.facebook}${encodeURIComponent(fullUrl)}`, "_blank");
      break;
    case "twitter":
      window.open(
        `${SHARE_URLS.twitter}${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
        "_blank"
      );
      break;
    case "linkedin":
      window.open(`${SHARE_URLS.linkedin}${encodeURIComponent(fullUrl)}`, "_blank");
      break;
    case "email":
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(emailBody || `Check out this article: ${fullUrl}`);
      window.location.href = `${SHARE_URLS.email}${subject}&body=${body}`;
      break;
    default:
      // Fallback to navigator.share if available (modern browsers)
      if (navigator.share) {
        navigator.share({
          title,
          url: fullUrl,
        }).catch(err => console.error("Error sharing:", err));
      } else {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(fullUrl)
          .then(() => alert("Link copied to clipboard!"))
          .catch(err => console.error("Could not copy link:", err));
      }
  }
};

/**
 * Function to handle sharing the entire site
 */
export const shareSite = () => {
  const siteUrl = window.location.origin;
  const siteTitle = "MedSafe Project - Medication Safety Matters";
  
  // Try to use navigator.share API first (mobile-friendly)
  if (navigator.share) {
    navigator.share({
      title: siteTitle,
      url: siteUrl
    }).catch(err => console.error("Error sharing:", err));
  } else {
    // Fallback to copying the URL to clipboard
    navigator.clipboard.writeText(siteUrl)
      .then(() => alert("Site URL copied to clipboard!"))
      .catch(err => console.error("Could not copy link:", err));
  }
};
