import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Tutors } from "@/components/Tutors";
import { About } from "@/components/About";
import { CTA } from "@/components/CTA";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Lebanese Arabic</h2>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/tutors")}>
                  Find Tutors
                </Button>
                <Button variant="ghost" onClick={() => navigate("/apply")}>
                  Become a Tutor
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>
      <div className="pt-16">
        <Hero />
        <Features />
        <Tutors />
        <About />
        <CTA />
      </div>
    </div>
  );
};

export default Index;
