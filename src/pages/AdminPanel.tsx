import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminApplications } from "@/components/admin/AdminApplications";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminCenters } from "@/components/admin/AdminCenters";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";
import { Shield } from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some(r => r.role === "admin");
    if (!hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-6">
            <SidebarTrigger className="mr-4" />
            <Shield className="w-5 h-5 text-primary mr-2" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="centers" element={<AdminCenters />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
