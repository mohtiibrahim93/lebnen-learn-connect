import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";

export function AdminApplications() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("tutor_applications")
        .select(`*, profiles:user_id (full_name, email)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string, userId: string) => {
    try {
      const { data: application } = await supabase
        .from("tutor_applications")
        .select("*")
        .eq("id", applicationId)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single();

      await supabase
        .from("tutor_applications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", applicationId);

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "tutor" });

      if (roleError && roleError.code !== "23505") throw roleError;

      await supabase.from("tutor_profiles").insert({
        user_id: userId,
        expertise: application?.expertise,
        experience_years: application?.experience_years,
        hourly_rate: application?.hourly_rate,
        specialties: application?.specialties,
        is_verified: true,
      });

      if (profile) {
        await supabase.functions.invoke("send-application-notification", {
          body: { to: profile.email, applicantName: profile.full_name || "Applicant", status: "approved" },
        });
      }

      toast({ title: "Application Approved" });
      fetchApplications();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (applicationId: string, userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single();

      await supabase
        .from("tutor_applications")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", applicationId);

      if (profile) {
        await supabase.functions.invoke("send-application-notification", {
          body: { to: profile.email, applicantName: profile.full_name || "Applicant", status: "rejected" },
        });
      }

      toast({ title: "Application Rejected" });
      fetchApplications();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor Applications</CardTitle>
        <CardDescription>Review and manage tutor applications</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-muted-foreground">No applications found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.profiles?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{app.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{app.expertise}</TableCell>
                  <TableCell>{app.experience_years} years</TableCell>
                  <TableCell>${app.hourly_rate}/hr</TableCell>
                  <TableCell>
                    <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(app.id, app.user_id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(app.id, app.user_id)}>
                          <XCircle className="w-4 h-4 mr-1" /> Reject
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
