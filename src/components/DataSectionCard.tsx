import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DataSectionCardProps {
  title: string;
  description: string;
  children: ReactNode;
  comingSoon?: boolean;
  footerContent?: ReactNode;
}

export function DataSectionCard({ 
  title, 
  description, 
  children, 
  comingSoon = false,
  footerContent 
}: DataSectionCardProps) {
  return (
    <Card className="group relative overflow-hidden 
      bg-white/80 dark:bg-charcoal/40 
      backdrop-blur-sm 
      border border-white/20 dark:border-white/10
      shadow-lg
      transition-all duration-300
      hover:shadow-xl hover:-translate-y-1
      hover:border-accent/20
      hover:shadow-accent/5">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 
        bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl md:text-2xl font-serif mb-2 text-charcoal dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </CardDescription>
          </div>
          {comingSoon && (
            <Badge variant="outline" className="shrink-0 text-xs border-accent/30 text-accent dark:text-accent">
              Coming soon
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {children}
        
        {footerContent && (
          <div className="mt-6 pt-6 border-t border-white/10 dark:border-white/5">
            {footerContent}
          </div>
        )}
        
        {comingSoon && (
          <div className="mt-6 flex justify-end">
            <Button 
              variant="outline" 
              disabled
              className="border-accent/20 text-accent/60 dark:text-accent/60"
            >
              Explore
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

