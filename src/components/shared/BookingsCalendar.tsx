import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { Clock, MapPin, User } from "lucide-react";

interface Booking {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  tutor_id: string;
  student_id: string;
  center_id: string | null;
  tutor_profile?: { full_name: string | null };
  student_profile?: { full_name: string | null };
  center?: { name: string };
}

interface BookingsCalendarProps {
  userId: string;
  role: "tutor" | "student";
}

export function BookingsCalendar({ userId, role }: BookingsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      const column = role === "tutor" ? "tutor_id" : "student_id";
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          center:teaching_centers(name)
        `)
        .eq(column, userId)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;

      // Fetch profile names separately
      const bookingsWithProfiles = await Promise.all(
        (data || []).map(async (booking) => {
          const otherUserId = role === "tutor" ? booking.student_id : booking.tutor_id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherUserId)
            .single();

          return {
            ...booking,
            [role === "tutor" ? "student_profile" : "tutor_profile"]: profile,
          };
        })
      );

      setBookings(bookingsWithProfiles);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) =>
      isSameDay(new Date(booking.scheduled_at), date)
    );
  };

  const selectedBookings = getBookingsForDate(selectedDate);

  const hasBookings = (date: Date) => {
    return bookings.some((booking) =>
      isSameDay(new Date(booking.scheduled_at), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              hasBooking: (date) => hasBookings(date),
            }}
            modifiersStyles={{
              hasBooking: {
                fontWeight: "bold",
                backgroundColor: "hsl(var(--primary) / 0.1)",
                borderRadius: "50%",
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">
            Lessons on {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : selectedBookings.length === 0 ? (
            <p className="text-muted-foreground">No lessons scheduled for this date.</p>
          ) : (
            <div className="space-y-4">
              {selectedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(booking.scheduled_at), "h:mm a")}
                        </span>
                        <span className="text-muted-foreground">
                          ({booking.duration_minutes} min)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {role === "tutor"
                            ? booking.student_profile?.full_name || "Student"
                            : booking.tutor_profile?.full_name || "Tutor"}
                        </span>
                      </div>

                      {booking.center && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {booking.center.name}
                          </span>
                        </div>
                      )}

                      {booking.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {booking.notes}
                        </p>
                      )}
                    </div>

                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
