
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "After my mother experienced a severe reaction from two medications that shouldn't have been prescribed together, I realized how critical medication safety education really is.",
    author: "Sarah Johnson",
    role: "Patient Advocate",
    image: "/lovable-uploads/8a40a1dd-9e4e-49b6-a9ab-5f4088d64ade.png",
  },
  {
    id: 2,
    quote: "As a pharmacist, I see potential drug interactions every day. Better awareness and tools are needed to prevent these incidents before they happen.",
    author: "Dr. Miguel Ramirez",
    role: "Clinical Pharmacist",
    image: "/lovable-uploads/02b407c1-3e5c-4d83-ba47-de13084a2151.png",
  },
  {
    id: 3,
    quote: "I nearly lost my father to a preventable adverse drug reaction. The MedSafe Project is doing vital work to raise awareness about these underreported dangers.",
    author: "James Chen",
    role: "Family Caregiver",
    image: "/lovable-uploads/15fc01fb-7936-49ac-a0ee-ddea34c0d484.png",
  },
];

export function TestimonialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-charcoal/20 rounded-lg shadow-md p-8 md:p-12">
      <div
        className="transition-transform duration-500 ease-in-out flex"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="min-w-full px-4"
          >
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-20 h-20 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={testimonial.image} alt={testimonial.author} className="object-cover" />
                  </Avatar>
                  <blockquote className="relative">
                    <div className="text-3xl text-red font-serif mb-6">"</div>
                    <p className="text-lg md:text-xl italic mb-6 text-gray-700 dark:text-gray-300">
                      {testimonial.quote}
                    </p>
                    <footer>
                      <div className="font-medium text-charcoal dark:text-white">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </footer>
                  </blockquote>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 right-6 flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevSlide}
          className="h-8 w-8 rounded-full"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextSlide}
          className="h-8 w-8 rounded-full"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-6 left-6 flex space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-red" : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
