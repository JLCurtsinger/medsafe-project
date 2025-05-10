
import React from 'react';
import { useActivePodcast } from '../contexts/ActivePodcastContext';
import { Minimize, X } from 'lucide-react';
import { Button } from './ui/button';

export const MiniPlayer: React.FC = () => {
  const { 
    activePodcastSrc, 
    activePodcastTitle, 
    isMinimized, 
    isPlayerVisible,
    toggleMinimized, 
    hidePlayer 
  } = useActivePodcast();

  if (!isPlayerVisible || !activePodcastSrc) return null;

  return (
    <div className={`fixed z-40 transition-all duration-300 bg-black/90 border-b border-gray-800 w-full shadow-lg ${isMinimized ? 'top-16 h-16' : 'top-16 h-96 md:h-80'}`}>
      <div className="container-custom h-full flex flex-col">
        <div className="flex justify-between items-center py-3 px-4">
          <h3 className="text-sm md:text-base font-medium text-white truncate flex-1">
            {isMinimized ? (
              <>
                <span className="text-red mr-1">▶</span> 
                <span className="truncate">{activePodcastTitle || 'Now Playing'}</span>
              </>
            ) : (
              'Now Playing'
            )}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800"
              onClick={toggleMinimized}
              aria-label={isMinimized ? "Expand player" : "Minimize player"}
            >
              <Minimize className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-gray-800"
              onClick={hidePlayer}
              aria-label="Close player"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex-1 px-4 pb-4 pt-0">
            <div className="h-full">
              <iframe
                style={{ borderRadius: "12px" }}
                src={activePodcastSrc || ''}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={activePodcastTitle || 'Podcast player'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
