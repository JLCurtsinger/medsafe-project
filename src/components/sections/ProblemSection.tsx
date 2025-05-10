
import { ScrollReveal } from "@/components/ScrollReveal";
import { AlertCircle } from "lucide-react";

export const ProblemSection = () => {
  return (
    <section className="py-20 relative bg-charcoal/95 text-white">
      {/* Added subtle visual element for the Problem section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC')] opacity-[0.03]"></div>
        {/* Blurred pill silhouette in the bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue/3 blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        {/* Semi-transparent abstract shape */}
        <div className="absolute top-10 left-0 w-80 h-80 bg-red/2 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/4"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <ScrollReveal>
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red/80" />
          </div>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-white">
              The Problem: Mixing Substances is the Real Killer.
            </h2>
            <p className="text-lg text-gray-300">
              Harmful drug reactions are a significant public health burden, yet many cases go unreported or unrecognized. These statistics reveal the scale of the problem.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal delay={100}>
            <div className="rounded-lg p-8 text-left" style={{ background: 'linear-gradient(135deg, #e14c3a, #d13d2d)' }}>
              <div className="text-5xl font-bold text-white mb-4">1.3M+</div>
              <p className="text-lg text-white/90 mb-8">
                Annual emergency department visits due to adverse drug events in the United States alone
              </p>
              <p className="text-sm text-white/70">
                Source: Centers for Disease Control and Prevention
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="rounded-lg p-8 text-left" style={{ background: 'linear-gradient(135deg, #269dbb, #1a8aa6)' }}>
              <div className="text-5xl font-bold text-white mb-4">350,000</div>
              <p className="text-lg text-white/90 mb-8">
                Patients admitted to hospitals each year because of adverse drug events
              </p>
              <p className="text-sm text-white/70">
                Source: Agency for Healthcare Research and Quality
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="rounded-lg p-8 text-left" style={{ background: 'linear-gradient(135deg, #4a5568, #3a4354)' }}>
              <div className="text-5xl font-bold text-white mb-4">40%</div>
              <p className="text-lg text-white/90 mb-8">
                Of adults over 65 take 5 or more prescription medications regularly
              </p>
              <p className="text-sm text-white/70">
                Source: Journal of the American Medical Association
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="rounded-lg p-8 text-left" style={{ background: 'linear-gradient(135deg, #e57373 0%, #5c6bc0 100%)' }}>
              <div className="text-5xl font-bold text-white mb-4">88%</div>
              <p className="text-lg text-white/90 mb-8">
                Of adverse drug events are potentially preventable with better medication management
              </p>
              <p className="text-sm text-white/70">
                Source: Institute for Safe Medication Practices
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
