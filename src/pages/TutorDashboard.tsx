import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, GraduationCap, ArrowLeft, Link as LinkIcon, DollarSign } from "lucide-react";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isTutor, setIsTutor] = useState(false);

  useEffect(() => {
    checkTutorAccess();
  }, []);

  const checkTutorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasTutorRole = roles?.some(r => r.role === "tutor");
    if (!hasTutorRole) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsTutor(true);
    fetchBookings(user.id);
  };

  const fetchBookings = async (tutorId: string) => {
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
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Check if payment is completed
      if (booking.payment_status !== "paid") {
        toast({
          title: "Cannot Confirm",
          description: "This booking hasn't been paid yet.",
          variant: "destructive",
        });
        return;
      }

      const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;

      // Get student profile
      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", booking.student_id)
        .single();

      const { error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          meeting_link: meetingLink,
        })
        .eq("id", bookingId);

      if (error) throw error;

      // Get tutor name
      const { data: { user } } = await supabase.auth.getUser();
      const { data: tutorData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();

      // Send confirmation email to student
      if (studentProfile) {
        await supabase.functions.invoke("send-booking-notification", {
          body: {
            to: studentProfile.email,
            studentName: studentProfile.full_name || "Student",
            tutorName: tutorData?.full_name || "Your tutor",
            scheduledAt: booking.scheduled_at,
            duration: booking.duration_minutes,
            meetingLink,
            status: "confirmed",
          },
        });
      }

      toast({
        title: "Booking Confirmed",
        description: "Meeting link has been generated and student notified.",
      });
      
      if (user) fetchBookings(user.id);
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
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Get student profile
      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", booking.student_id)
        .single();

      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      // Get tutor name
      const { data: { user } } = await supabase.auth.getUser();
      const { data: tutorData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();

      // Send cancellation email to student
      if (studentProfile) {
        await supabase.functions.invoke("send-booking-notification", {
          body: {
            to: studentProfile.email,
            studentName: studentProfile.full_name || "Student",
            tutorName: tutorData?.full_name || "Your tutor",
            scheduledAt: booking.scheduled_at,
            duration: booking.duration_minutes,
            status: "cancelled",
          },
        });
      }

      toast({
        title: "Booking Cancelled",
        description: "The student has been notified.",
      });
      
      if (user) fetchBookings(user.id);
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

  if (!isTutor) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Tutor Dashboard</h1>
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
            <CardDescription>Manage your lesson bookings and meeting links</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading bookings...</p>
            ) : bookings.length === 0 ? (
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
                            Copy Link
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not generated</span>
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
      </div>
    </div>
  );
}
