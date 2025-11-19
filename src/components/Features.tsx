import { BookOpen, MessageCircle, Target, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    description: "Engage with structured courses designed specifically for Lebanese Arabic dialect.",
  },
  {
    icon: MessageCircle,
    title: "Real Conversations",
    description: "Practice with authentic dialogues used in everyday Lebanese situations.",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description: "Adaptive curriculum that matches your pace and learning style.",
  },
  {
    icon: Headphones,
    title: "Audio by Natives",
    description: "Perfect your pronunciation with recordings from native Lebanese speakers.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Learn Lebanese Arabic{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">Effectively</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Our platform combines modern technology with proven language learning methods
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-warm flex items-center justify-center mb-4 shadow-soft">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
