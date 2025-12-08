import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, User, DollarSign, Clock, BookOpen, X, Plus, ArrowRight, ArrowLeft } from "lucide-react";

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export default function TutorOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Profile
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
  });

  // Step 2: Teaching Info
  const [teachingInfo, setTeachingInfo] = useState({
    expertise: "Lebanese Arabic",
    hourly_rate: 25,
    experience_years: 1,
    specialties: ["Conversational Lebanese"] as string[],
  });
  const [newSpecialty, setNewSpecialty] = useState("");

  // Step 3: Availability
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load existing profile data
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
      });
    }

    // Load existing tutor profile
    const { data: tutorData } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (tutorData) {
      setTeachingInfo({
        expertise: tutorData.expertise || "Lebanese Arabic",
        hourly_rate: tutorData.hourly_rate || 25,
        experience_years: tutorData.experience_years || 1,
        specialties: tutorData.specialties || ["Conversational Lebanese"],
      });
    }

    // Load existing availability
    const { data: availData } = await supabase
      .from("tutor_availability")
      .select("*")
      .eq("tutor_id", user.id);

    if (availData && availData.length > 0) {
      setAvailability(availData.map(a => ({
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
      })));
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !teachingInfo.specialties.includes(newSpecialty.trim())) {
      setTeachingInfo({
        ...teachingInfo,
        specialties: [...teachingInfo.specialties, newSpecialty.trim()],
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setTeachingInfo({
      ...teachingInfo,
      specialties: teachingInfo.specialties.filter(s => s !== specialty),
    });
  };

  const addAvailabilitySlot = () => {
    const exists = availability.some(
      slot => slot.day_of_week === newSlot.day_of_week &&
        slot.start_time === newSlot.start_time &&
        slot.end_time === newSlot.end_time
    );

    if (!exists) {
      setAvailability([...availability, { ...newSlot }]);
    }
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update tutor profile
      const { error: tutorError } = await supabase
        .from("tutor_profiles")
        .update({
          expertise: teachingInfo.expertise,
          hourly_rate: teachingInfo.hourly_rate,
          experience_years: teachingInfo.experience_years,
          specialties: teachingInfo.specialties,
        })
        .eq("user_id", user.id);

      if (tutorError) throw tutorError;

      // Delete existing availability and insert new
      await supabase
        .from("tutor_availability")
        .delete()
        .eq("tutor_id", user.id);

      if (availability.length > 0) {
        const { error: availError } = await supabase
          .from("tutor_availability")
          .insert(
            availability.map(slot => ({
              tutor_id: user.id,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_active: true,
            }))
          );

        if (availError) throw availError;
      }

      toast({
        title: "Welcome aboard!",
        description: "Your tutor profile is now complete. Start teaching!",
      });

      navigate("/tutor-dashboard");
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

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, New Tutor!</h1>
          <p className="text-muted-foreground">Let's set up your profile so students can find you</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { icon: User, label: "Profile" },
            { icon: DollarSign, label: "Teaching" },
            { icon: Clock, label: "Availability" },
            { icon: CheckCircle2, label: "Complete" },
          ].map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center gap-1 ${
                index + 1 <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index + 1 < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index + 1 === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span className="text-xs hidden sm:block">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Tell students about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell students about your background, teaching style, and what makes you unique..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Profile Picture URL</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Teaching Information
                </CardTitle>
                <CardDescription>Set your rates and areas of expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="1"
                      value={teachingInfo.hourly_rate}
                      onChange={(e) => setTeachingInfo({ ...teachingInfo, hourly_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={teachingInfo.experience_years}
                      onChange={(e) => setTeachingInfo({ ...teachingInfo, experience_years: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expertise">Area of Expertise</Label>
                  <Textarea
                    id="expertise"
                    value={teachingInfo.expertise}
                    onChange={(e) => setTeachingInfo({ ...teachingInfo, expertise: e.target.value })}
                    placeholder="Describe your main areas of expertise..."
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {teachingInfo.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                        {specialty}
                        <button type="button" onClick={() => removeSpecialty(specialty)}>
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
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                    />
                    <Button type="button" variant="outline" onClick={addSpecialty}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Set Your Availability
                </CardTitle>
                <CardDescription>Let students know when you're available to teach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                      value={newSlot.day_of_week}
                      onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                    >
                      {DAYS_OF_WEEK.map((day, index) => (
                        <option key={day} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={addAvailabilitySlot}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>

                {availability.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Your Schedule</Label>
                    <div className="space-y-2">
                      {availability.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span>
                            <strong>{DAYS_OF_WEEK[slot.day_of_week]}</strong>: {slot.start_time} - {slot.end_time}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAvailabilitySlot(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {availability.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No availability added yet. Add at least one time slot.
                  </p>
                )}
              </CardContent>
            </>
          )}

          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Ready to Go!
                </CardTitle>
                <CardDescription>Review your information and start teaching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Profile</h4>
                    <p><strong>Name:</strong> {profile.full_name || "Not set"}</p>
                    <p><strong>Bio:</strong> {profile.bio || "Not set"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Teaching</h4>
                    <p><strong>Rate:</strong> ${teachingInfo.hourly_rate}/hour</p>
                    <p><strong>Experience:</strong> {teachingInfo.experience_years} years</p>
                    <p><strong>Specialties:</strong> {teachingInfo.specialties.join(", ") || "None"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Availability</h4>
                    {availability.length > 0 ? (
                      <ul className="space-y-1">
                        {availability.map((slot, i) => (
                          <li key={i}>{DAYS_OF_WEEK[slot.day_of_week]}: {slot.start_time} - {slot.end_time}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No availability set</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </Card>

        {/* Skip option */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => navigate("/tutor-dashboard")}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
