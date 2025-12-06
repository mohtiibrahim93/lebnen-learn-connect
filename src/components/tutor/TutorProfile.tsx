import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, DollarSign, Bell, Shield, X, Plus } from "lucide-react";

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
  const [newSpecialty, setNewSpecialty] = useState("");
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailReminders: true,
    emailMarketing: false,
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
          specialties: tutorProfile.specialties,
        })
        .eq("user_id", tutorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Teaching settings updated successfully!",
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

  const addSpecialty = () => {
    if (newSpecialty.trim() && !tutorProfile.specialties.includes(newSpecialty.trim())) {
      setTutorProfile({
        ...tutorProfile,
        specialties: [...tutorProfile.specialties, newSpecialty.trim()],
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setTutorProfile({
      ...tutorProfile,
      specialties: tutorProfile.specialties.filter((s) => s !== specialty),
    });
  };

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Check your email for password reset instructions.",
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {profile.full_name?.charAt(0).toUpperCase() || "T"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{profile.full_name || "Tutor"}</h2>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="teaching" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Teaching</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and public profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell students about yourself, your teaching style, and background..."
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teaching">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Settings</CardTitle>
              <CardDescription>Configure your rates, experience, and specialties</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateTutorProfile} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={tutorProfile.hourly_rate}
                      onChange={(e) => setTutorProfile({ ...tutorProfile, hourly_rate: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={tutorProfile.experience_years}
                      onChange={(e) => setTutorProfile({ ...tutorProfile, experience_years: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Area of Expertise</Label>
                  <Textarea
                    id="expertise"
                    value={tutorProfile.expertise}
                    onChange={(e) => setTutorProfile({ ...tutorProfile, expertise: e.target.value })}
                    rows={3}
                    placeholder="Describe your main areas of expertise..."
                  />
                </div>

                <div className="space-y-4">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {tutorProfile.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a specialty..."
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSpecialty();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSpecialty}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Teaching Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Booking Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified when students book or cancel lessons</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailBookings}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailBookings: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Lesson Reminders</p>
                    <p className="text-sm text-muted-foreground">Receive reminders before upcoming lessons</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive tips, updates, and promotional content</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailMarketing}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailMarketing: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={() => toast({ title: "Preferences saved" })}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    We'll send you an email with a link to reset your password.
                  </p>
                  <Button variant="outline" onClick={handlePasswordChange}>
                    Send Password Reset Email
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Account ID</span>
                      <span className="font-mono">{tutorId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Email</span>
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Role</span>
                      <Badge variant="secondary">Tutor</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
