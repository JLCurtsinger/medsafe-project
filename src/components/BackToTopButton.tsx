
import React from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToTop, useScrollToTop } from "@/utils/scrollUtils";
import { cn } from "@/lib/utils";

export function BackToTopButton() {
  const { showButton } = useScrollToTop();
  
  return (
    <Button
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-blue hover:bg-blue/90 text-white rounded-full p-3 shadow-md transition-all duration-300",
        showButton 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
      size="icon"
      onClick={() => scrollToTop()}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
