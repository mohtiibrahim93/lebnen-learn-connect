import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";
import { TutorOverview } from "@/components/tutor/TutorOverview";
import { TutorCalendar } from "@/components/tutor/TutorCalendar";
import { TutorBookings } from "@/components/tutor/TutorBookings";
import { TutorStudents } from "@/components/tutor/TutorStudents";
import { TutorCourses } from "@/components/tutor/TutorCourses";
import { TutorProfile } from "@/components/tutor/TutorProfile";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    checkTutorAccess();
  }, []);

  const checkTutorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasTutorRole = roles?.some(r => r.role === "tutor");
    if (!hasTutorRole) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setTutorId(user.id);
    setLoading(false);
  };

  if (loading || !tutorId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-bold">Tutor Dashboard</h1>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route index element={<TutorOverview tutorId={tutorId} />} />
              <Route path="calendar" element={<TutorCalendar tutorId={tutorId} />} />
              <Route path="bookings" element={<TutorBookings tutorId={tutorId} />} />
              <Route path="students" element={<TutorStudents tutorId={tutorId} />} />
              <Route path="courses" element={<TutorCourses tutorId={tutorId} />} />
              <Route path="profile" element={<TutorProfile tutorId={tutorId} />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
