
import { ScrollReveal } from "@/components/ScrollReveal";
import { SEO } from "@/components/SEO";

export default function Podcasts() {
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
                Welcome to The MedSafe Podcast—where we raise awareness about the hidden dangers of adverse drug interactions. Below you can listen to our latest episode.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto mb-16">
              <iframe 
                style={{borderRadius: "12px"}} 
                src="https://open.spotify.com/embed/episode/2nMad50XXJwgLMxqlgxo9X?utm_source=generator&theme=0&t=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                title="The MedSafe Podcast Episode One"
              />
            </div>
          </ScrollReveal>
          
          <ScrollReveal>
            <div className="max-w-4xl mx-auto mb-16">
              <iframe 
                style={{borderRadius: "12px"}} 
                src="https://open.spotify.com/embed/episode/5dmqOpgjaGfDpu2im2G1v4?utm_source=generator&theme=0&t=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                title="The MedSafe Podcast Episode Two"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto mb-16">
              <iframe 
                style={{ borderRadius: "12px" }} 
                src="https://open.spotify.com/embed/episode/3pnnOSmCJ2drxZQ38c5So1?utm_source=generator&theme=0&t=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                title="The MedSafe Podcast Episode Three"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto mb-16">
              <iframe 
                style={{ borderRadius: "12px" }} 
                src="https://open.spotify.com/embed/episode/3I9F8OeObx111FEQorzUdS?utm_source=generator&theme=0&t=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                title="The MedSafe Podcast Episode Four"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto mb-16">
              <iframe 
                style={{ borderRadius: "12px" }} 
                src="https://open.spotify.com/embed/episode/2Gq3gXq4ArtsQV3Jj8R2Wx?utm_source=generator&theme=0&t=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                title="The MedSafe Podcast Episode Five"
              />
            </div>
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
