import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentOverview } from "@/components/student/StudentOverview";
import { StudentBookings } from "@/components/student/StudentBookings";
import { StudentCourses } from "@/components/student/StudentCourses";
import { StudentProfile } from "@/components/student/StudentProfile";
import { StudentTutorSearch } from "@/components/student/StudentTutorSearch";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const bookingId = searchParams.get("booking");

    if (payment === "success" && bookingId) {
      verifyPayment(bookingId);
    } else if (payment === "cancelled") {
      toast({
        title: "Payment Cancelled",
        description: "Your booking payment was cancelled.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);
  };

  const verifyPayment = async (bookingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-lesson-payment", {
        body: { bookingId },
      });

      if (error) throw error;

      if (data?.status === "paid") {
        toast({
          title: "Payment Successful!",
          description: "Your lesson has been confirmed.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Verification Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StudentSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <BookOpen className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">Student Dashboard</h1>
              </div>
              <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route index element={<StudentOverview studentId={user.id} />} />
                <Route path="bookings" element={<StudentBookings studentId={user.id} />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="search" element={<StudentTutorSearch />} />
                <Route path="profile" element={<StudentProfile userId={user.id} />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
