
import { ScrollReveal } from "@/components/ScrollReveal";
import { SEO } from "@/components/SEO";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Podcast } from "@/components/Podcast";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Podcasts() {
  const isMobile = useIsMobile();
  const [defaultLanguage] = useState("english");
  const [defaultSeason] = useState("season1");
  
  // Schema data for the podcast page
  const podcastSchemaData = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "name": "The MedSafe Podcast",
    "description": "Raising awareness about the hidden dangers of adverse drug interactions",
    "associatedMedia": {
      "@type": "MediaObject",
      "contentUrl": "https://open.spotify.com/episode/2nMad50XXJwgLMxqlgxo9X"
    }
  };

  return (
    <>
      <SEO 
        title="The MedSafe Podcast | Medication Safety | MedSafe Project"
        description="Listen to the MedSafe Podcast where we raise awareness about the hidden dangers of adverse drug interactions."
        keywords={["medication safety podcast", "drug interaction podcast", "healthcare podcast", "medication awareness", "patient safety"]}
        schemaData={podcastSchemaData}
      />
      
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container-custom">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                The MedSafe Podcast
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Welcome to The MedSafe Podcast—where we raise awareness about the hidden dangers of adverse drug interactions. Listen to our episodes below.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <Card className="max-w-4xl mx-auto mb-16 border-0 shadow-sm">
              <CardContent className="p-0">
                <Accordion type="single" collapsible defaultValue={defaultLanguage} className="w-full">
                  {/* English Section */}
                  <AccordionItem value="english" className="border-b-0">
                    <AccordionTrigger className="px-6 py-4 text-xl font-serif font-semibold text-charcoal dark:text-white">
                      English
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4">
                        <Accordion type="single" collapsible defaultValue={defaultSeason} className="w-full">
                          {/* Season 1 */}
                          <AccordionItem value="season1" className="border-b-0">
                            <AccordionTrigger className="text-lg font-medium">
                              Season 1
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-6 mb-6">
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/2nMad50XXJwgLMxqlgxo9X?utm_source=generator&theme=0&t=0"
                                  title="Episode 1: Introduction to Medication Safety"
                                />
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/5dmqOpgjaGfDpu2im2G1v4?utm_source=generator&theme=0&t=0"
                                  title="Episode 2: Understanding Drug Interactions"
                                />
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/3pnnOSmCJ2drxZQ38c5So1?utm_source=generator&theme=0&t=0"
                                  title="Episode 3: Patient Stories"
                                />
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/3I9F8OeObx111FEQorzUdS?utm_source=generator&theme=0&t=0"
                                  title="Episode 4: Healthcare Provider Perspectives"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          {/* Season 2 */}
                          <AccordionItem value="season2" className="border-b-0">
                            <AccordionTrigger className="text-lg font-medium">
                              Season 2
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-6 mb-6">
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/42uST8EEtDLS0QFghAdVuR?utm_source=generator&theme=0&t=0"
                                  title="Episode 1: New Frontiers in Medication Safety"
                                />
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/63Z519Gobta6SxRr5fGp1J?utm_source=generator&theme=0&t=0"
                                  title="Episode 2: Technology Solutions"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* Español Section */}
                  <AccordionItem value="espanol" className="border-b-0">
                    <AccordionTrigger className="px-6 py-4 text-xl font-serif font-semibold text-charcoal dark:text-white">
                      Español (Spanish)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4">
                        <Accordion type="single" collapsible defaultValue="season1_es" className="w-full">
                          {/* Season 1 - Spanish */}
                          <AccordionItem value="season1_es" className="border-b-0">
                            <AccordionTrigger className="text-lg font-medium">
                              Temporada 1
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-6 mb-6">
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/2Gq3gXq4ArtsQV3Jj8R2Wx?utm_source=generator&theme=0&t=0"
                                  title="Episodio 1: Introducción a la Seguridad de Medicamentos"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* Hindi Section */}
                  <AccordionItem value="hindi" className="border-b-0">
                    <AccordionTrigger className="px-6 py-4 text-xl font-serif font-semibold text-charcoal dark:text-white">
                      हिंदी (Hindi)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4">
                        <Accordion type="single" collapsible defaultValue="season1_hi" className="w-full">
                          {/* Season 1 - Hindi */}
                          <AccordionItem value="season1_hi" className="border-b-0">
                            <AccordionTrigger className="text-lg font-medium">
                              सीज़न 1
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-6 mb-6">
                                <Podcast 
                                  src="https://open.spotify.com/embed/episode/7AD5ltMCbxLYsf04m0WTpS?utm_source=generator&theme=0&t=0"
                                  title="एपिसोड 1: दवा सुरक्षा का परिचय"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>
          
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                Stay Tuned for More Episodes
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Follow our podcast to get notifications when new episodes are released. We discuss critical topics related to medication safety, feature expert interviews, and share stories from patients who have experienced adverse drug interactions.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
