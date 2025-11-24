import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingDialog } from "@/components/BookingDialog";
import { Instagram, Youtube, Music2, MapPin, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-lebanese.jpg";

export default function LandingPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [tutorId, setTutorId] = useState<string>("");

  useEffect(() => {
    fetchTutorId();
  }, []);

  const fetchTutorId = async () => {
    // Fetch the main tutor's ID
    const { data } = await supabase
      .from("tutor_profiles")
      .select("user_id")
      .eq("is_verified", true)
      .limit(1)
      .single();
    
    if (data) {
      setTutorId(data.user_id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            Learn Lebanese Arabic
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Master the beautiful Lebanese dialect with personalized lessons at creative learning spaces in your city
          </p>
          <Button 
            size="lg" 
            variant="hero"
            onClick={() => setBookingOpen(true)}
            className="text-lg px-8 py-6"
          >
            Book Your First Lesson
          </Button>
          
          <div className="flex justify-center gap-6 mt-8">
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Music2 className="w-8 h-8" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="w-8 h-8" />
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Youtube className="w-8 h-8" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Learn Lebanese Arabic?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <Users className="w-12 h-12 mb-4 text-primary" />
                <CardTitle>Small Groups</CardTitle>
                <CardDescription>
                  Personalized attention in intimate learning environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn at your own pace with customized lessons designed for your goals
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <MapPin className="w-12 h-12 mb-4 text-primary" />
                <CardTitle>Multiple Locations</CardTitle>
                <CardDescription>
                  Choose the creative space closest to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Convenient locations across the city at partner creative centers
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Calendar className="w-12 h-12 mb-4 text-primary" />
                <CardTitle>Flexible Schedule</CardTitle>
                <CardDescription>
                  Currently twice a week, more times coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Book lessons that fit your schedule with easy online booking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">About Your Teacher</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              As a native Lebanese speaker, I bring authentic language learning combined with 
              cultural insights. My teaching style focuses on practical conversation skills, 
              helping you speak confidently in real-world situations. Whether you're learning 
              for travel, family connections, or cultural appreciation, I'll guide you every step 
              of the way.
            </p>
            <Button 
              size="lg"
              onClick={() => setBookingOpen(true)}
            >
              Start Learning Today
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-warm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-primary-foreground">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join me at Raduga Creative and other inspiring locations for an immersive 
            Lebanese Arabic learning experience
          </p>
          <Button 
            size="lg"
            variant="outline"
            className="bg-background text-foreground hover:bg-background/90"
            onClick={() => setBookingOpen(true)}
          >
            Book Your Lesson Now
          </Button>
        </div>
      </section>

      <BookingDialog
        tutorId={tutorId} 
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}
