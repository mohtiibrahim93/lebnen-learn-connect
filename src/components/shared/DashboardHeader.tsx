import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { NotificationBell } from "./NotificationBell";

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <Home className="h-4 w-4" />
          </Button>
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>
        
        <div className="flex items-center gap-2">
          <RoleSwitcher />
          <NotificationBell />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
