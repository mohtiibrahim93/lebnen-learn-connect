import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Calendar } from "lucide-react";

interface BookingDialogProps {
  tutorId: string;
  open: boolean;
  onClose: () => void;
}

export const BookingDialog = ({ tutorId, open, onClose }: BookingDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
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
    }
  }, [open]);

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
    
    setLoading(true);

    try {
      // Create booking first
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

      // Create payment session
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-lesson-payment",
        {
          body: { bookingId: booking.id },
        }
      );

      if (paymentError) throw paymentError;

      // Redirect to Stripe checkout
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book a Lesson
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Payment is required upfront. You'll be redirected to secure checkout after submitting.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="datetime">Preferred Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="30"
              step="30"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="center">Learning Center</Label>
            <Select
              value={formData.center_id}
              onValueChange={(value) => setFormData({ ...formData, center_id: value })}
              required
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
              placeholder="What would you like to focus on in this lesson?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Processing..." : "Continue to Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
