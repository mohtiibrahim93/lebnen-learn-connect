import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";

interface TutorAvailabilityProps {
  tutorId: string;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export function TutorAvailability({ tutorId }: TutorAvailabilityProps) {
  const { toast } = useToast();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "10:00",
  });

  useEffect(() => {
    fetchAvailability();
  }, [tutorId]);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("tutor_availability")
      .select("*")
      .eq("tutor_id", tutorId)
      .order("day_of_week")
      .order("start_time");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } else {
      setSlots(data || []);
    }
    setLoading(false);
  };

  const addSlot = async () => {
    if (newSlot.start_time >= newSlot.end_time) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("tutor_availability").insert({
      tutor_id: tutorId,
      day_of_week: newSlot.day_of_week,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      is_active: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("unique") 
          ? "This time slot already exists" 
          : "Failed to add slot",
        variant: "destructive",
      });
    } else {
      toast({ title: "Slot added successfully" });
      fetchAvailability();
    }
  };

  const toggleSlot = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("tutor_availability")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update slot",
        variant: "destructive",
      });
    } else {
      setSlots(slots.map(s => s.id === id ? { ...s, is_active: !isActive } : s));
    }
  };

  const deleteSlot = async (id: string) => {
    const { error } = await supabase
      .from("tutor_availability")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive",
      });
    } else {
      setSlots(slots.filter(s => s.id !== id));
      toast({ title: "Slot deleted" });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupedSlots = DAYS.map(day => ({
    ...day,
    slots: slots.filter(s => s.day_of_week === day.value),
  }));

  if (loading) {
    return <div className="text-center py-8">Loading availability...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Add Availability Slot
          </CardTitle>
          <CardDescription>
            Set your weekly recurring availability for students to book lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Day</label>
              <Select
                value={newSlot.day_of_week.toString()}
                onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: parseInt(v) })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Select
                value={newSlot.start_time}
                onValueChange={(v) => setNewSlot({ ...newSlot, start_time: v })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Select
                value={newSlot.end_time}
                onValueChange={(v) => setNewSlot({ ...newSlot, end_time: v })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addSlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Your current availability slots. Toggle to enable/disable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {groupedSlots.map((day) => (
              <div key={day.value} className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {day.label}
                </h3>
                {day.slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No availability set</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {day.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          slot.is_active 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-muted/50 border-muted"
                        }`}
                      >
                        <Badge variant={slot.is_active ? "default" : "secondary"}>
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </Badge>
                        <Switch
                          checked={slot.is_active}
                          onCheckedChange={() => toggleSlot(slot.id, slot.is_active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteSlot(slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
