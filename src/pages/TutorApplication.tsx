import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function TutorApplication() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    expertise: "",
    experience_years: "",
    hourly_rate: "",
    specialties: "",
    motivation: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);

    // Check if user already has a pending or approved application
    const { data } = await supabase
      .from("tutor_applications")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (data) {
      toast({
        title: "Application exists",
        description: `You already have a ${data.status} application.`,
      });
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const specialtiesArray = formData.specialties
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const { error } = await supabase.from("tutor_applications").insert({
        user_id: user.id,
        expertise: formData.expertise,
        experience_years: parseInt(formData.experience_years),
        hourly_rate: parseFloat(formData.hourly_rate),
        specialties: specialtiesArray,
        motivation: formData.motivation,
      });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      navigate("/");
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto p-8 shadow-elevated">
          <h1 className="text-3xl font-bold mb-2">Apply to Become a Tutor</h1>
          <p className="text-muted-foreground mb-8">
            Share your expertise in Lebanese Arabic with students worldwide
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expertise">Area of Expertise</Label>
              <Input
                id="expertise"
                placeholder="e.g., Conversational Lebanese Arabic"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Teaching Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                min="1"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input
                id="specialties"
                placeholder="e.g., Beginners, Business Arabic, Cultural Context"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Why do you want to teach Lebanese Arabic?</Label>
              <Textarea
                id="motivation"
                placeholder="Tell us about your passion for teaching..."
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                required
                rows={5}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
