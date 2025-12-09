import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, BookOpen, Shield, ChevronDown } from "lucide-react";

const roleConfig: Record<UserRole, { icon: typeof GraduationCap; label: string; path: string }> = {
  student: { icon: GraduationCap, label: "Student", path: "/student-dashboard" },
  tutor: { icon: BookOpen, label: "Tutor", path: "/tutor-dashboard" },
  admin: { icon: Shield, label: "Admin", path: "/admin" },
};

export function RoleSwitcher() {
  const { roles } = useAuth();
  const navigate = useNavigate();

  // Don't show if user has only one role
  if (roles.length <= 1) return null;

  const currentPath = window.location.pathname;
  const currentRole = roles.find(role => currentPath.includes(roleConfig[role].path)) || roles[0];
  const CurrentIcon = roleConfig[currentRole].icon;

  const handleRoleSwitch = (role: UserRole) => {
    navigate(roleConfig[role].path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{roleConfig[currentRole].label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const isActive = role === currentRole;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={isActive ? "bg-accent" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.label}
              {isActive && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
