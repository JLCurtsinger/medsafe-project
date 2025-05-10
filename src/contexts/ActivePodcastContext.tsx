import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ActivePodcastContextType {
  activePodcastSrc: string | null;
  activePodcastTitle: string | null;
  isMinimized: boolean;
  isPlayerVisible: boolean;
  setActivePodcast: (src: string, title: string) => void;
  clearActivePodcast: () => void;
  toggleMinimized: () => void;
  hidePlayer: () => void;
}

const ActivePodcastContext = createContext<ActivePodcastContextType | undefined>(undefined);

export const ActivePodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePodcastSrc, setActivePodcastSrc] = useState<string | null>(null);
  const [activePodcastTitle, setActivePodcastTitle] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  // Auto-collapse player when navigating between pages, but don't stop playback
  useEffect(() => {
    if (isPlayerVisible && !isMinimized) {
      setIsMinimized(true);
    }
    // We're not clearing or resetting the player on navigation
    // This keeps the audio playing across page transitions
  }, [location.pathname]);

  const setActivePodcast = (src: string, title: string) => {
    // Make sure the autoplay parameter is properly set
    // For Spotify embeds, we need to use autoplay=1 parameter
    let autoplaySrc = src;
    
    // If the URL doesn't already have autoplay parameter
    if (!autoplaySrc.includes('autoplay=1')) {
      autoplaySrc = src.includes('?') 
        ? `${src}&autoplay=1` 
        : `${src}?autoplay=1`;
    }
    
    setActivePodcastSrc(autoplaySrc);
    setActivePodcastTitle(title);
    setIsPlayerVisible(true);
    setIsMinimized(false);
  };

  const clearActivePodcast = () => {
    setActivePodcastSrc(null);
    setActivePodcastTitle(null);
    setIsPlayerVisible(false);
  };

  const toggleMinimized = () => {
    setIsMinimized(prev => !prev);
  };

  const hidePlayer = () => {
    setIsPlayerVisible(false);
    setActivePodcastSrc(null);
    setActivePodcastTitle(null);
  };

  return (
    <ActivePodcastContext.Provider 
      value={{ 
        activePodcastSrc, 
        activePodcastTitle, 
        isMinimized,
        isPlayerVisible,
        setActivePodcast, 
        clearActivePodcast,
        toggleMinimized,
        hidePlayer
      }}
    >
      {children}
    </ActivePodcastContext.Provider>
  );
};

export const useActivePodcast = () => {
  const context = useContext(ActivePodcastContext);
  if (context === undefined) {
    throw new Error('useActivePodcast must be used within an ActivePodcastProvider');
  }
  return context;
};
