import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function StudentBookings({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, [studentId]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          tutor_profiles!inner(
            user_id,
            profiles:user_id (full_name, email)
          )
        `)
        .eq("student_id", studentId)
        .order("scheduled_at", { ascending: false });

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

  const openMeetingLink = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>View all your lesson sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No bookings yet.</p>
            <Button onClick={() => navigate("/student-dashboard/search")}>
              Find a Tutor
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Meeting Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {booking.tutor_profiles?.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.tutor_profiles?.profiles?.email}
                      </p>
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
                        variant="default"
                        onClick={() => openMeetingLink(booking.meeting_link)}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {booking.status === "pending"
                          ? "Waiting"
                          : "No link"}
                      </span>
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
