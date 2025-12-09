import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireOnboarded?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireOnboarded = true 
}: ProtectedRouteProps) {
  const { user, loading, roles, isOnboarded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check role access
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some(role => roles.includes(role));
      if (!hasAccess) {
        // Redirect to appropriate dashboard based on roles
        if (roles.includes("admin")) {
          navigate("/admin");
        } else if (roles.includes("tutor")) {
          navigate("/tutor-dashboard");
        } else if (roles.includes("student")) {
          navigate("/student-dashboard");
        } else {
          navigate("/");
        }
        return;
      }
    }

    // Check onboarding for tutors
    if (requireOnboarded && roles.includes("tutor") && !isOnboarded) {
      navigate("/tutor-onboarding");
      return;
    }
  }, [user, loading, roles, isOnboarded, allowedRoles, requireOnboarded, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.some(role => roles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}
