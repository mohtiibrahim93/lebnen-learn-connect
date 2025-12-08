import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, UserPlus } from "lucide-react";

interface AddRoleCardProps {
  userId: string;
  currentRoles: string[];
  onRoleAdded: () => void;
}

export function AddRoleCard({ userId, currentRoles, onRoleAdded }: AddRoleCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const canAddStudent = !currentRoles.includes("student");
  const canAddTutor = !currentRoles.includes("tutor");

  if (!canAddStudent && !canAddTutor) {
    return null;
  }

  const handleAddRole = async (role: "student" | "tutor") => {
    setLoading(true);

    try {
      // Insert new role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (roleError) throw roleError;

      // If adding tutor role, create tutor profile
      if (role === "tutor") {
        const { error: profileError } = await supabase
          .from("tutor_profiles")
          .insert({
            user_id: userId,
            expertise: "Lebanese Arabic",
            hourly_rate: 25,
            specialties: ["Conversational Lebanese"],
          });

        if (profileError) throw profileError;
      }

      toast({
        title: "Role Added!",
        description: `You are now also a ${role}. ${role === "tutor" ? "Complete your tutor profile to start teaching." : "You can now book lessons with tutors."}`,
      });

      onRoleAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5" />
          Expand Your Role
        </CardTitle>
        <CardDescription>
          You can have multiple roles on our platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canAddTutor && (
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Become a Tutor</p>
                <p className="text-sm text-muted-foreground">
                  Share your knowledge and earn money teaching
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleAddRole("tutor")}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Role"}
            </Button>
          </div>
        )}

        {canAddStudent && (
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium">Become a Student</p>
                <p className="text-sm text-muted-foreground">
                  Learn Lebanese Arabic from native speakers
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleAddRole("student")}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Role"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
