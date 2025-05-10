
import React from "react";
import { useActivePodcast } from "../contexts/ActivePodcastContext";
import { AspectRatio } from "./ui/aspect-ratio";

interface PodcastProps {
  src: string;
  title: string;
  isVisible?: boolean;
}

export function Podcast({ src, title, isVisible = false }: PodcastProps) {
  const { setActivePodcast } = useActivePodcast();

  // The play button for the podcast
  const handlePlayClick = () => {
    setActivePodcast(src, title);
  };

  return (
    <div>
      <h3 className="text-md font-medium mb-2 text-charcoal dark:text-gray-200">
        {title}
      </h3>
      
      {isVisible ? (
        // Only render the iframe if this podcast is visible (expanded in the accordion)
        <div className="relative rounded-xl overflow-hidden bg-gray-900">
          <div 
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            onClick={handlePlayClick}
          >
            <div className="bg-red text-white rounded-full p-4 flex items-center justify-center hover:bg-red/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
          <div className="bg-gradient-to-b from-black/40 to-black/20 absolute inset-0 z-0"></div>
          <div className="w-full h-[222px] flex items-center justify-center">
            <img 
              src="/lovable-uploads/a3325ae9-2426-4c62-842a-a77ede97fad1.png" 
              alt={title} 
              className="max-h-full max-w-full object-contain opacity-50"
            />
          </div>
        </div>
      ) : (
        // If not visible, just show a play button
        <div 
          className="flex items-center gap-4 hover:bg-black/10 dark:hover:bg-white/10 p-4 rounded-xl cursor-pointer transition-colors"
          onClick={handlePlayClick}
        >
          <div className="bg-red text-white rounded-full p-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <div className="flex-1">
            Listen Now
          </div>
        </div>
      )}
    </div>
  );
}
