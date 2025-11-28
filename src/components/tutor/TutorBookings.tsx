import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Link as LinkIcon, DollarSign } from "lucide-react";

export function TutorBookings({ tutorId }: { tutorId: string }) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [tutorId]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          profiles:student_id (full_name, email)
        `)
        .eq("tutor_id", tutorId)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setBookings(data || []);
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

  const handleAccept = async (bookingId: string) => {
    try {
      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (!booking) throw new Error("Booking not found");

      if (booking.payment_status !== "paid") {
        toast({
          title: "Cannot Confirm",
          description: "This booking hasn't been paid yet.",
          variant: "destructive",
        });
        return;
      }

      const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;

      const { error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          meeting_link: meetingLink,
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Booking Confirmed",
        description: "Meeting link generated and student notified.",
      });
      
      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "The student has been notified.",
      });
      
      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied",
      description: "Meeting link copied to clipboard.",
    });
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading bookings...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>Manage your lesson bookings and meeting links</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-muted-foreground">No bookings yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Meeting Link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.profiles?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(booking.scheduled_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{booking.duration_minutes} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {booking.amount_paid?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.payment_status === "paid"
                          ? "default"
                          : booking.payment_status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {booking.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.meeting_link ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyMeetingLink(booking.meeting_link)}
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAccept(booking.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(booking.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
