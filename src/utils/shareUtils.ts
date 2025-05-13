
import { toast } from "sonner";

/**
 * Utility functions for sharing content
 */

// Social media sharing URLs
const SHARE_URLS = {
  facebook: "https://www.facebook.com/sharer/sharer.php?u=",
  twitter: "https://twitter.com/intent/tweet?url=",
  linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=",
  reddit: "https://www.reddit.com/submit?url=",
  email: "mailto:?subject=",
};

/**
 * Opens a share dialog for the specified platform
 * @param platform The platform to share on (facebook, twitter, linkedin, reddit, email)
 * @param url The URL to share
 * @param title The title to share (used for email subject, twitter text, and reddit title)
 * @param emailBody Optional body text for email sharing
 */
export const shareContent = (
  platform: "facebook" | "twitter" | "linkedin" | "reddit" | "email",
  url: string,
  title: string,
  emailBody?: string
) => {
  // Get the full absolute URL if a relative URL is provided
  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  
  // Handle different share platforms
  switch (platform) {
    case "facebook":
      window.open(`${SHARE_URLS.facebook}${encodeURIComponent(fullUrl)}`, "_blank", "noopener,noreferrer");
      break;
    case "twitter":
      window.open(
        `${SHARE_URLS.twitter}${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
        "_blank", "noopener,noreferrer"
      );
      break;
    case "linkedin":
      window.open(`${SHARE_URLS.linkedin}${encodeURIComponent(fullUrl)}`, "_blank", "noopener,noreferrer");
      break;
    case "reddit":
      window.open(`${SHARE_URLS.reddit}${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`, "_blank", "noopener,noreferrer");
      break;
    case "email":
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(emailBody || `Check out this page: ${fullUrl}`);
      window.location.href = `${SHARE_URLS.email}${subject}&body=${body}`;
      break;
    default:
      // Fallback to navigator.share if available (modern browsers)
      if (navigator.share) {
        navigator.share({
          title,
          url: fullUrl,
        }).catch(err => {
          console.error("Error sharing:", err);
          toast.error("Could not share. Please try again.");
        });
      } else {
        // Copy to clipboard as fallback if specific platform share fails and navigator.share is unavailable (should not happen with specific platform calls)
        navigator.clipboard.writeText(fullUrl)
          .then(() => toast.success("Link copied to clipboard!"))
          .catch(err => {
            console.error("Could not copy link:", err)
            toast.error("Could not copy link.");
          });
      }
  }
};

/**
 * Function to handle sharing the entire site using native share or clipboard fallback
 */
export const shareSite = () => {
  const siteUrl = "https://www.medsafeproject.org"; // Use fixed site URL
  const siteTitle = "MedSafe Project - Medication Safety Matters";
  
  // Try to use navigator.share API first (mobile-friendly)
  if (navigator.share) {
    navigator.share({
      title: siteTitle,
      url: siteUrl
    }).catch(err => {
        console.error("Error using navigator.share:", err)
        // Fallback to copying the URL to clipboard if navigator.share fails or is cancelled by user
        navigator.clipboard.writeText(siteUrl)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch(copyErr => {
          console.error("Could not copy link:", copyErr);
          toast.error("Sharing failed and link could not be copied.");
        });
    });
  } else {
    // Fallback to copying the URL to clipboard
    navigator.clipboard.writeText(siteUrl)
      .then(() => toast.success("Site URL copied to clipboard!"))
      .catch(err => {
        console.error("Could not copy link:", err);
        toast.error("Could not copy link. Please try manually.");
      });
  }
};

