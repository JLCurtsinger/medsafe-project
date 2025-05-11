
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import { BackToTopButton } from "./components/BackToTopButton";
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Podcasts from "./pages/Podcasts";
import About from "./pages/About";
import Tools from "./pages/Tools";
import { NotFound } from "./pages/NotFound";
import { useEffect } from 'react';

const queryClient = new QueryClient();
const GA_MEASUREMENT_ID = "G-E949V1HZHT";

const App: React.FC = () => {
useEffect(() => {
  // Load Google Analytics
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-E949V1HZHT';
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-E949V1HZHT');
  `;
  document.head.appendChild(script2);

  // Optional: Cleanup on unmount
  return () => {
    document.head.removeChild(script1);
    document.head.removeChild(script2);
  };
}, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HelmetProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/article/:slug" element={<ArticleDetail />} />
                  <Route path="/podcasts" element={<Podcasts />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <BackToTopButton />
            </div>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
