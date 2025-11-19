import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";

const tutors = [
  {
    name: "Layla Hassan",
    expertise: "Conversational Lebanese Arabic",
    experience: "8 years teaching experience",
    rating: 4.9,
    students: 250,
    price: "$25/hour",
    specialties: ["Beginners", "Business Arabic", "Cultural Context"],
  },
  {
    name: "Karim Makdessi",
    expertise: "Lebanese Dialect & Grammar",
    experience: "5 years teaching experience",
    rating: 4.8,
    students: 180,
    price: "$22/hour",
    specialties: ["Grammar", "Writing", "Advanced Learners"],
  },
  {
    name: "Nour Saab",
    expertise: "Everyday Lebanese Expressions",
    experience: "6 years teaching experience",
    rating: 5.0,
    students: 320,
    price: "$28/hour",
    specialties: ["Pronunciation", "Slang", "Cultural Immersion"],
  },
];

export const Tutors = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Connect with{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">Expert Tutors</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Learn directly from native speakers who understand Lebanese culture and language nuances
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tutors.map((tutor, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-foreground">{tutor.name}</h3>
                  <p className="text-sm text-muted-foreground">{tutor.experience}</p>
                </div>
                <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="text-sm font-semibold text-foreground">{tutor.rating}</span>
                </div>
              </div>

              <p className="text-foreground font-medium mb-3">{tutor.expertise}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {tutor.specialties.map((specialty, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-secondary/50">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                <span>{tutor.students} students</span>
                <span className="font-semibold text-primary text-lg">{tutor.price}</span>
              </div>

              <Button className="w-full" variant="default">
                <Calendar className="w-4 h-4 mr-2" />
                Book a Lesson
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            View All Tutors
          </Button>
        </div>
      </div>
    </section>
  );
};
