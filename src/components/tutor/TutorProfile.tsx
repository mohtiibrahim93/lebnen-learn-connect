import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TutorProfile({ tutorId }: { tutorId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    bio: "",
    avatar_url: "",
  });
  const [tutorProfile, setTutorProfile] = useState({
    hourly_rate: 0,
    experience_years: 0,
    expertise: "",
    specialties: [] as string[],
  });

  useEffect(() => {
    fetchProfile();
    fetchTutorProfile();
  }, [tutorId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", tutorId)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTutorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("tutor_profiles")
        .select("*")
        .eq("user_id", tutorId)
        .maybeSingle();

      if (error) throw error;
      if (data) setTutorProfile(data);
    } catch (error: any) {
      console.error("Error fetching tutor profile:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        })
        .eq("id", tutorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
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

  const handleUpdateTutorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("tutor_profiles")
        .update({
          hourly_rate: tutorProfile.hourly_rate,
          experience_years: tutorProfile.experience_years,
          expertise: tutorProfile.expertise,
        })
        .eq("user_id", tutorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tutor profile updated successfully!",
      });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {profile.full_name?.charAt(0).toUpperCase() || "T"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                placeholder="Tell students about yourself..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tutor Settings</CardTitle>
          <CardDescription>Update your teaching information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateTutorProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={tutorProfile.hourly_rate}
                  onChange={(e) => setTutorProfile({ ...tutorProfile, hourly_rate: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={tutorProfile.experience_years}
                  onChange={(e) => setTutorProfile({ ...tutorProfile, experience_years: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="expertise">Expertise</Label>
              <Textarea
                id="expertise"
                value={tutorProfile.expertise}
                onChange={(e) => setTutorProfile({ ...tutorProfile, expertise: e.target.value })}
                rows={3}
                placeholder="Describe your expertise..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
