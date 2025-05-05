
import { ScrollReveal } from "@/components/ScrollReveal";
import { TeamMember } from "@/components/TeamMember";

export default function About() {
  const team = [
    {
      name: "Dr. Emily Rodriguez",
      role: "Founder & Medical Advisor",
      bio: "Clinical pharmacist with 15 years of experience in medication safety research. Founded MedSafe Project after witnessing preventable adverse drug events.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=3000&auto=format&fit=crop",
    },
    {
      name: "Michael Chen",
      role: "Patient Advocate Director",
      bio: "Former tech executive who experienced a serious adverse drug reaction. Now dedicated to raising awareness about medication safety issues.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3000&auto=format&fit=crop",
    },
    {
      name: "Dr. Aisha Johnson",
      role: "Research Lead",
      bio: "Specializes in pharmacoepidemiology with a focus on adverse drug event reporting systems and prevention strategies.",
      image: "https://images.unsplash.com/photo-1629111480404-1350c6df89b8?q=80&w=3000&auto=format&fit=crop",
    },
    {
      name: "Thomas Patel",
      role: "Education Coordinator",
      bio: "Former healthcare educator focused on creating accessible resources about medication safety for patients and healthcare providers.",
      image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=3000&auto=format&fit=crop",
    },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container-custom">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
              About The MedSafe Project
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A grassroots initiative dedicated to medication safety awareness and education.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <ScrollReveal>
            <div>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                Our Mission
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The MedSafe Project was founded in 2020 by a coalition of healthcare professionals, patient advocates, and individuals affected by adverse drug events. Our mission is to reduce preventable medication-related harm through education, awareness, and advocacy.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We believe that by improving public understanding of medication safety issues and promoting the use of reliable tools and resources, we can help prevent thousands of adverse drug reactions each year.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                The MedSafe Project operates as a non-profit initiative, free from commercial interests or pharmaceutical industry funding. Our work is guided solely by our commitment to patient safety and public health.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
                Our Goals
              </h2>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="bg-red rounded-full w-6 h-6 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 mt-1">1</div>
                  <p className="text-gray-700 dark:text-gray-300">Raise public awareness about the prevalence and preventability of adverse drug interactions.</p>
                </li>
                <li className="flex">
                  <div className="bg-red rounded-full w-6 h-6 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 mt-1">2</div>
                  <p className="text-gray-700 dark:text-gray-300">Provide educational resources to help patients have more informed conversations with their healthcare providers.</p>
                </li>
                <li className="flex">
                  <div className="bg-red rounded-full w-6 h-6 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 mt-1">3</div>
                  <p className="text-gray-700 dark:text-gray-300">Highlight and review tools that can help identify potential medication interactions.</p>
                </li>
                <li className="flex">
                  <div className="bg-red rounded-full w-6 h-6 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 mt-1">4</div>
                  <p className="text-gray-700 dark:text-gray-300">Advocate for improved medication safety systems and policies at institutional and national levels.</p>
                </li>
                <li className="flex">
                  <div className="bg-red rounded-full w-6 h-6 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 mt-1">5</div>
                  <p className="text-gray-700 dark:text-gray-300">Build a community of advocates and experts dedicated to reducing medication-related harm.</p>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="bg-blue/5 dark:bg-blue/10 rounded-lg p-8 mb-20">
            <h2 className="text-2xl font-serif font-semibold mb-4 text-charcoal dark:text-white text-center">
              Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-center max-w-4xl mx-auto">
              The information provided by the MedSafe Project is for educational purposes only and is not intended as medical advice. Always consult with a qualified healthcare provider regarding your medications and health concerns. The MedSafe Project does not endorse specific products or treatments, and any tools or resources mentioned are provided for informational purposes only.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mb-16">
            <h2 className="text-2xl font-serif font-semibold mb-8 text-charcoal dark:text-white text-center">
              Our Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <ScrollReveal key={member.name} delay={index * 100}>
                  <TeamMember {...member} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold mb-4 text-charcoal dark:text-white">
              Get Involved
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We welcome collaboration with healthcare professionals, patient advocates, researchers, and anyone passionate about medication safety. If you're interested in supporting our mission or contributing to our resources, please get in touch.
            </p>
            <div className="inline-block bg-blue text-white px-6 py-3 rounded-md">
              Contact: info@medsafeproject.org
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
