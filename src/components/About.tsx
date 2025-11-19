import { Card } from "@/components/ui/card";
import { Globe, Heart, TrendingUp } from "lucide-react";

export const About = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Learn{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">Lebanese Arabic?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Lebanese Arabic is more than just a dialect—it's a gateway to rich culture and meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center mx-auto mb-4 shadow-soft">
                <Globe className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Cultural Bridge</h3>
              <p className="text-sm text-muted-foreground">
                Connect deeply with Lebanese heritage, history, and modern society
              </p>
            </Card>

            <Card className="p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center mx-auto mb-4 shadow-soft">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Family Roots</h3>
              <p className="text-sm text-muted-foreground">
                Reconnect with your heritage and communicate with family members
              </p>
            </Card>

            <Card className="p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center mx-auto mb-4 shadow-soft">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Career Growth</h3>
              <p className="text-sm text-muted-foreground">
                Unlock opportunities in business, media, and international relations
              </p>
            </Card>
          </div>

          <Card className="p-8 border-border/50 bg-card/50 backdrop-blur">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">About Lebanese Arabic</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Lebanese Arabic is the unique dialect spoken in Lebanon, influenced by centuries of cultural exchange. 
                It's known for its melodic quality and French loanwords, making it distinct from other Arabic dialects.
              </p>
              <p>
                Whether you're planning to visit Lebanon, have family connections, or simply love languages, 
                learning Lebanese Arabic opens doors to understanding Middle Eastern culture from a unique perspective.
              </p>
              <p className="font-medium text-foreground">
                Our platform makes learning this beautiful dialect accessible, engaging, and effective.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
