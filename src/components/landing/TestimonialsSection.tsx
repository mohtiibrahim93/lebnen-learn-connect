import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  id: string;
  student_name: string;
  review_text: string;
  rating: number;
  avatar_url: string | null;
  course_level: string | null;
}

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setTestimonials(data);
      }
    };

    fetchTestimonials();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-amber-400 text-amber-400" : "text-muted"
        }`}
      />
    ));
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Ce Spun Studenții Noștri
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descoperă experiențele celor care învață deja limba arabă libaneză cu noi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-card hover:shadow-lg transition-all duration-300 border-border/50"
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.student_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {testimonial.student_name}
                    </h4>
                    {testimonial.course_level && (
                      <p className="text-sm text-muted-foreground">
                        Nivel {testimonial.course_level}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.review_text}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
