import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TutorStudents({ tutorId }: { tutorId: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [tutorId]);

  const fetchStudents = async () => {
    try {
      // Get unique students from bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("student_id")
        .eq("tutor_id", tutorId);

      if (!bookings) return;

      // Get unique student IDs
      const uniqueStudentIds = [...new Set(bookings.map(b => b.student_id))];

      // Fetch profiles for these students
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", uniqueStudentIds);

      if (!profiles) return;

      // Count sessions per student
      const studentMap = new Map();
      profiles.forEach((profile) => {
        const sessionCount = bookings.filter(b => b.student_id === profile.id).length;
        studentMap.set(profile.id, {
          ...profile,
          sessionCount,
        });
      });

      setStudents(Array.from(studentMap.values()));
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading students...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Students</CardTitle>
        <CardDescription>Students who have booked lessons with you</CardDescription>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-muted-foreground">No students yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.full_name?.charAt(0).toUpperCase() || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{student.full_name || "Unknown"}</h4>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary">
                      {student.sessionCount} {student.sessionCount === 1 ? "session" : "sessions"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
