import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Calendar, FileText } from "lucide-react";

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalBookings: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [usersRes, tutorsRes, bookingsRes, applicationsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("tutor_profiles").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("tutor_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalTutors: tutorsRes.count || 0,
      totalBookings: bookingsRes.count || 0,
      pendingApplications: applicationsRes.count || 0,
    });
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Active Tutors", value: stats.totalTutors, icon: GraduationCap, color: "text-green-500" },
    { title: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-purple-500" },
    { title: "Pending Applications", value: stats.pendingApplications, icon: FileText, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
