
import React, { useRef, useEffect, useId } from "react";
import { usePodcastContext } from "../contexts/PodcastContext";

interface PodcastProps {
  src: string;
  title: string;
}

export function Podcast({ src, title }: PodcastProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { currentlyPlayingId, setCurrentlyPlayingId } = usePodcastContext();
  const id = useId(); // Generate a unique ID for this podcast instance
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Create a listener for messages from the Spotify iframe
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from Spotify embeds
      if (event.origin !== "https://open.spotify.com") return;
      
      try {
        const data = JSON.parse(event.data);
        
        // Check if this is a playback event from this specific iframe
        if (data && data.type === "playback_update" && iframe.contentWindow === event.source) {
          // If this podcast started playing
          if (data.data && data.data.isPaused === false) {
            // Update the currently playing ID
            setCurrentlyPlayingId(id);
          }
          
          // If this podcast was paused and it's the currently playing one, reset the ID
          if (data.data && data.data.isPaused === true && currentlyPlayingId === id) {
            setCurrentlyPlayingId(null);
          }
        }
      } catch (e) {
        // Ignore parsing errors from non-JSON messages
      }
    };

    // When another podcast starts playing, pause this one if it's playing
    if (currentlyPlayingId && currentlyPlayingId !== id) {
      // Send pause command to Spotify iframe
      iframe.contentWindow?.postMessage('{"command":"pause"}', "https://open.spotify.com");
    }
    
    // Add event listener for messages from Spotify iframe
    window.addEventListener("message", handleMessage);
    
    return () => {
      // Clean up the event listener when component unmounts
      window.addEventListener("message", handleMessage);
    };
  }, [currentlyPlayingId, id, setCurrentlyPlayingId]);

  return (
    <div>
      <h3 className="text-md font-medium mb-2 text-charcoal dark:text-gray-200">
        {title}
      </h3>
      <iframe
        ref={iframeRef}
        style={{ borderRadius: "12px" }}
        src={src}
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={title}
      />
    </div>
  );
}
