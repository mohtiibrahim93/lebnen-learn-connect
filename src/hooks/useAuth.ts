import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export type UserRole = "student" | "tutor" | "admin";

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: UserRole[];
  loading: boolean;
  isOnboarded: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    roles: [],
    loading: true,
    isOnboarded: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer role fetching
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, roles: [], loading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data: rolesData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;

      const roles = rolesData?.map(r => r.role as UserRole) || [];
      
      // Check if tutor needs onboarding
      let isOnboarded = true;
      if (roles.includes("tutor")) {
        const { data: tutorProfile } = await supabase
          .from("tutor_profiles")
          .select("expertise, hourly_rate, experience_years")
          .eq("user_id", userId)
          .maybeSingle();

        // Consider onboarded if they have set expertise and hourly rate meaningfully
        isOnboarded = !!(tutorProfile && tutorProfile.hourly_rate > 0 && tutorProfile.experience_years >= 0);
      }

      setAuthState(prev => ({
        ...prev,
        roles,
        isOnboarded,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching roles:", error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const hasRole = (role: UserRole) => authState.roles.includes(role);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const redirectBasedOnRole = () => {
    if (authState.roles.includes("admin")) {
      navigate("/admin");
    } else if (authState.roles.includes("tutor")) {
      if (!authState.isOnboarded) {
        navigate("/tutor-onboarding");
      } else {
        navigate("/tutor-dashboard");
      }
    } else if (authState.roles.includes("student")) {
      navigate("/student-dashboard");
    } else {
      navigate("/");
    }
  };

  const addRole = async (role: UserRole) => {
    if (!authState.user) return { error: "Not authenticated" };
    
    try {
      // Check if user already has this role
      if (authState.roles.includes(role)) {
        return { error: "You already have this role" };
      }

      // Insert new role (admin-only operation, so use RPC)
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: authState.user.id, role });

      if (error) throw error;

      // If adding tutor role, create tutor profile
      if (role === "tutor") {
        await supabase
          .from("tutor_profiles")
          .insert({
            user_id: authState.user.id,
            expertise: "Lebanese Arabic",
            hourly_rate: 25,
            specialties: ["Conversational Lebanese"],
          });
      }

      // Refresh roles
      await fetchUserRoles(authState.user.id);
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    ...authState,
    hasRole,
    signOut,
    redirectBasedOnRole,
    addRole,
    refetchRoles: () => authState.user && fetchUserRoles(authState.user.id),
  };
}
