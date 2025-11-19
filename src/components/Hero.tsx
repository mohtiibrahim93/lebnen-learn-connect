import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import heroImage from "@/assets/hero-lebanese.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/70" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <div className="inline-block mb-4 px-4 py-2 bg-accent/20 rounded-full border border-accent/30">
            <span className="text-sm font-medium text-foreground">Learn Authentic Lebanese Arabic</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master Lebanese Arabic{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">Your Way</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Learn through interactive lessons or connect with experienced native-speaking professors. 
            Your journey to fluency starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button variant="hero" size="lg" className="group">
              Start Learning Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Find a Tutor
            </Button>
          </div>

          <div className="flex flex-wrap gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Self-Paced Lessons</div>
                <div className="text-muted-foreground">Learn at your own speed</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Expert Tutors</div>
                <div className="text-muted-foreground">Native speakers ready to help</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
