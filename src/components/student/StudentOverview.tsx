import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Stats {
  upcomingBookings: number;
  totalBookings: number;
  enrolledCourses: number;
  totalHours: number;
}

export function StudentOverview({ studentId }: { studentId: string }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    upcomingBookings: 0,
    totalBookings: 0,
    enrolledCourses: 0,
    totalHours: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentBookings();
  }, [studentId]);

  const fetchStats = async () => {
    try {
      // Get all bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("duration_minutes, scheduled_at, status")
        .eq("student_id", studentId);

      // Get upcoming bookings
      const { data: upcoming } = await supabase
        .from("bookings")
        .select("id")
        .eq("student_id", studentId)
        .in("status", ["pending", "confirmed"])
        .gte("scheduled_at", new Date().toISOString());

      // Calculate total hours
      const totalMinutes = bookings?.reduce((sum, b) => sum + (b.duration_minutes || 0), 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);

      setStats({
        upcomingBookings: upcoming?.length || 0,
        totalBookings: bookings?.length || 0,
        enrolledCourses: 0, // Will be implemented when course enrollment is added
        totalHours,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const { data } = await supabase
        .from("bookings")
        .select(`
          *,
          tutor_profiles!inner(
            user_id,
            profiles:user_id (full_name, email)
          )
        `)
        .eq("student_id", studentId)
        .order("scheduled_at", { ascending: false })
        .limit(5);

      setRecentBookings(data || []);
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Total time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your latest lesson sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Button onClick={() => navigate("/student-dashboard/search")}>
                Find a Tutor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {booking.tutor_profiles?.profiles?.full_name || "Unknown Tutor"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduled_at).toLocaleString()} • {booking.duration_minutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{booking.status}</p>
                    <p className="text-xs text-muted-foreground capitalize">{booking.payment_status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
