import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, ArrowLeft, ExternalLink, DollarSign } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const bookingId = searchParams.get("booking");

    if (payment === "success" && bookingId) {
      verifyPayment(bookingId);
    } else if (payment === "cancelled") {
      toast({
        title: "Payment Cancelled",
        description: "Your booking payment was cancelled.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);
    fetchBookings(user.id);
  };

  const fetchBookings = async (studentId: string) => {
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

  const verifyPayment = async (bookingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-lesson-payment", {
        body: { bookingId },
      });

      if (error) throw error;

      if (data?.status === "paid") {
        toast({
          title: "Payment Successful!",
          description: "Your lesson has been confirmed.",
        });
        if (user) fetchBookings(user.id);
      }
    } catch (error: any) {
      toast({
        title: "Payment Verification Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openMeetingLink = (link: string) => {
    window.open(link, "_blank");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Student Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>View your upcoming and past lessons</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No bookings yet.</p>
                <Button onClick={() => navigate("/tutors")}>
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
                            Join Meeting
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {booking.status === "pending"
                              ? "Waiting for confirmation"
                              : "No link available"}
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
      </div>
    </div>
  );
}
