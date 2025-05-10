
import React, { createContext, useContext, useState, useRef } from 'react';

type PodcastContextType = {
  currentlyPlayingId: string | null;
  setCurrentlyPlayingId: (id: string | null) => void;
};

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  return (
    <PodcastContext.Provider value={{ currentlyPlayingId, setCurrentlyPlayingId }}>
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcastContext = () => {
  const context = useContext(PodcastContext);
  if (context === undefined) {
    throw new Error('usePodcastContext must be used within a PodcastProvider');
  }
  return context;
};
