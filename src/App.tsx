
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
import Data from "./pages/Data";
import Blog from "./pages/Blog";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient();
const GA_MEASUREMENT_ID = "G-E949V1HZHT";

const App: React.FC = () => {
useEffect(() => {
  // Google Analytics
  const gaScript1 = document.createElement('script');
  gaScript1.async = true;
  gaScript1.src = 'https://www.googletagmanager.com/gtag/js?id=G-E949V1HZHT';
  document.head.appendChild(gaScript1);

  const gaScript2 = document.createElement('script');
  gaScript2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-E949V1HZHT');
  `;
  document.head.appendChild(gaScript2);

  // Google AdSense
  const adsenseScript = document.createElement('script');
  adsenseScript.async = true;
  adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7469694080179788';
  adsenseScript.crossOrigin = 'anonymous';
  document.head.appendChild(adsenseScript);

  // Cleanup on unmount
  return () => {
    document.head.removeChild(gaScript1);
    document.head.removeChild(gaScript2);
    document.head.removeChild(adsenseScript);
  };
}, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HelmetProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
                  <Route path="/data" element={<Data />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
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
