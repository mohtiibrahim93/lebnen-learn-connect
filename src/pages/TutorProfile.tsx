import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BookingDialog } from "@/components/BookingDialog";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  BookOpen 
} from "lucide-react";

export default function TutorProfile() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (tutorId) {
      fetchTutorData();
    }
  }, [tutorId]);

  const fetchTutorData = async () => {
    try {
      const { data: tutorData, error: tutorError } = await supabase
        .from("tutor_profiles")
        .select(`
          *,
          profiles:user_id (full_name, email, bio, avatar_url)
        `)
        .eq("user_id", tutorId)
        .single();

      if (tutorError) throw tutorError;

      const { data: coursesData } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", tutorId)
        .eq("is_published", true);

      setTutor(tutorData);
      setCourses(coursesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/tutors");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading tutor profile...</p>
      </div>
    );
  }

  if (!tutor) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/tutors")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tutors
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={tutor.profiles?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {tutor.profiles?.full_name?.charAt(0) || "T"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{tutor.profiles?.full_name}</CardTitle>
                <CardDescription>{tutor.expertise}</CardDescription>
                {tutor.is_verified && (
                  <Badge variant="default" className="mt-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Tutor
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span>{tutor.rating.toFixed(1)} rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{tutor.total_students} students</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{tutor.experience_years} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">${tutor.hourly_rate}/hour</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {tutor.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setBookingOpen(true)}
                >
                  Book a Lesson
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {tutor.profiles?.bio || "No bio available."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Courses ({courses.length})
                </CardTitle>
                <CardDescription>
                  Published courses by this tutor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-muted-foreground">No courses available yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {courses.map((course) => (
                      <Card key={course.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.level}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {course.duration_minutes} min
                            </span>
                            <Button size="sm" variant="outline">
                              View Course
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {tutorId && (
        <BookingDialog
          tutorId={tutorId}
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
