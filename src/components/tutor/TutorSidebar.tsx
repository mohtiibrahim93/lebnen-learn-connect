import { LayoutDashboard, Calendar, CalendarDays, Users, BookOpen, Settings, LogOut, Clock, MessageSquare } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Overview", url: "/tutor-dashboard", icon: LayoutDashboard },
  { title: "Calendar", url: "/tutor-dashboard/calendar", icon: CalendarDays },
  { title: "Availability", url: "/tutor-dashboard/availability", icon: Clock },
  { title: "Bookings", url: "/tutor-dashboard/bookings", icon: Calendar },
  { title: "Messages", url: "/tutor-dashboard/messages", icon: MessageSquare },
  { title: "Students", url: "/tutor-dashboard/students", icon: Users },
  { title: "Courses", url: "/tutor-dashboard/courses", icon: BookOpen },
  { title: "Profile", url: "/tutor-dashboard/profile", icon: Settings },
];

export function TutorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold ${collapsed ? "text-xs text-center" : "text-lg"}`}>
            {collapsed ? "TD" : "Tutor Dashboard"}
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="hover:bg-muted/50" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
