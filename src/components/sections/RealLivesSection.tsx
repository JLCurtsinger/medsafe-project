
import { ScrollReveal } from "@/components/ScrollReveal";
import { TestimonialSlider } from "@/components/TestimonialSlider";

export const RealLivesSection = () => {
  return (
    <section className="py-20 bg-blue/5 dark:bg-blue/10">
      <div className="container-custom">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
              Real Lives, Real Stories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Behind every statistic is a person whose life has been affected by medication errors.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <TestimonialSlider />
        </ScrollReveal>
      </div>
    </section>
  );
};
