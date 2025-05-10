
import React from "react";

interface PodcastProps {
  src: string;
  title: string;
}

export function Podcast({ src, title }: PodcastProps) {
  return (
    <div>
      <h3 className="text-md font-medium mb-2 text-charcoal dark:text-gray-200">
        {title}
      </h3>
      <iframe
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
