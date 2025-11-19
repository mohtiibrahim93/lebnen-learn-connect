import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookingDialog } from "@/components/BookingDialog";

interface TutorProfile {
  id: string;
  user_id: string;
  expertise: string;
  experience_years: number;
  hourly_rate: number;
  specialties: string[];
  rating: number;
  total_students: number;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function TutorSearch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const { data, error } = await supabase
        .from("tutor_profiles")
        .select(`
          *,
          profiles!tutor_profiles_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("is_verified", true);

      if (error) throw error;
      setTutors(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load tutors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter((tutor) =>
    tutor.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading tutors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Tutor</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Browse our verified Lebanese Arabic tutors
          </p>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by expertise, name, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredTutors.map((tutor) => (
              <Card key={tutor.id} className="p-6 hover:shadow-elevated transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {tutor.profiles.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tutor.experience_years} years experience
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-semibold">{tutor.rating}</span>
                  </div>
                </div>

                <p className="font-medium mb-3">{tutor.expertise}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {tutor.total_students} students
                  </span>
                  <span className="font-semibold text-primary text-lg">
                    ${tutor.hourly_rate}/hour
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/tutor/${tutor.user_id}`)}
                    variant="outline"
                  >
                    View Profile
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setSelectedTutorId(tutor.user_id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Lesson
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredTutors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tutors found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {selectedTutorId && (
        <BookingDialog
          tutorId={selectedTutorId}
          open={!!selectedTutorId}
          onClose={() => setSelectedTutorId(null)}
        />
      )}
    </div>
  );
}
