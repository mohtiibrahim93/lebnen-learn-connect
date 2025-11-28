import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, BookOpen } from "lucide-react";

interface Stats {
  totalEarnings: number;
  totalStudents: number;
  upcomingBookings: number;
  totalCourses: number;
}

export function TutorOverview({ tutorId }: { tutorId: string }) {
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    totalStudents: 0,
    upcomingBookings: 0,
    totalCourses: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentBookings();
  }, [tutorId]);

  const fetchStats = async () => {
    try {
      // Get total earnings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("amount_paid")
        .eq("tutor_id", tutorId)
        .eq("payment_status", "paid");

      const totalEarnings = bookings?.reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0;

      // Get unique students
      const { data: uniqueStudents } = await supabase
        .from("bookings")
        .select("student_id")
        .eq("tutor_id", tutorId);

      const totalStudents = new Set(uniqueStudents?.map(b => b.student_id)).size;

      // Get upcoming bookings
      const { data: upcoming } = await supabase
        .from("bookings")
        .select("id")
        .eq("tutor_id", tutorId)
        .in("status", ["pending", "confirmed"])
        .gte("scheduled_at", new Date().toISOString());

      // Get total courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("tutor_id", tutorId);

      setStats({
        totalEarnings,
        totalStudents,
        upcomingBookings: upcoming?.length || 0,
        totalCourses: courses?.length || 0,
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
          profiles:student_id (full_name, email)
        `)
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false })
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
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From all bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending & confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Created courses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your latest lesson requests</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent bookings</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{booking.profiles?.full_name || "Unknown"}</p>
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
