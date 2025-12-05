import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, setHours, setMinutes, isBefore, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface BookingDialogProps {
  tutorId: string;
  open: boolean;
  onClose: () => void;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const BookingDialog = ({ tutorId, open, onClose }: BookingDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    scheduled_at: "",
    duration_minutes: "60",
    center_id: "",
    notes: "",
  });

  useEffect(() => {
    checkAuth();
    if (open) {
      fetchCenters();
      fetchAvailability();
    }
  }, [open, tutorId]);

  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      generateAvailableSlots();
    }
  }, [selectedDate, availability]);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("tutor_availability")
      .select("*")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);

    if (!error && data) {
      setAvailability(data);
    }
  };

  const fetchCenters = async () => {
    const { data, error } = await supabase
      .from("teaching_centers")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      setCenters(data);
    }
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a lesson.",
        variant: "destructive",
      });
      onClose();
      return;
    }
    setUser(user);
  };

  const generateAvailableSlots = () => {
    if (!selectedDate) return;
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
    
    const slots: string[] = [];
    const now = new Date();
    
    dayAvailability.forEach(slot => {
      const [startHour, startMin] = slot.start_time.split(":").map(Number);
      const [endHour, endMin] = slot.end_time.split(":").map(Number);
      
      let current = setMinutes(setHours(date, startHour), startMin);
      const end = setMinutes(setHours(date, endHour), endMin);
      
      while (isBefore(current, end)) {
        if (isBefore(now, current)) {
          slots.push(format(current, "HH:mm"));
        }
        current = new Date(current.getTime() + 30 * 60000); // 30 min increments
      }
    });
    
    setAvailableSlots(slots.sort());
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSlotSelect = (time: string) => {
    const dateTime = `${selectedDate}T${time}`;
    setFormData({ ...formData, scheduled_at: dateTime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.center_id) {
      toast({
        title: "Location Required",
        description: "Please select a learning center.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.scheduled_at) {
      toast({
        title: "Time Required",
        description: "Please select an available time slot.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          student_id: user.id,
          tutor_id: tutorId,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          duration_minutes: parseInt(formData.duration_minutes),
          center_id: formData.center_id,
          notes: formData.notes,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-lesson-payment",
        {
          body: { bookingId: booking.id },
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.url) {
        window.location.href = paymentData.url;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Generate next 14 days for date selection
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
    };
  });

  const selectedTimeSlot = formData.scheduled_at 
    ? formData.scheduled_at.split("T")[1]?.slice(0, 5) 
    : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book a Lesson
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Select from the tutor's available time slots.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a date" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Available Times
              </Label>
              {availableSlots.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  No available slots for this day
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {availableSlots.map((time) => (
                    <Badge
                      key={time}
                      variant={selectedTimeSlot === time ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleSlotSelect(time)}
                    >
                      {formatTimeDisplay(time)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select
              value={formData.duration_minutes}
              onValueChange={(value) => setFormData({ ...formData, duration_minutes: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="center">Learning Center</Label>
            <Select
              value={formData.center_id}
              onValueChange={(value) => setFormData({ ...formData, center_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {centers.map((center) => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name} - {center.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="What would you like to focus on?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.scheduled_at} 
              className="flex-1"
            >
              {loading ? "Processing..." : "Continue to Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
