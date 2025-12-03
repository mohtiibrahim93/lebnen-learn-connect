import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Star, Trash2 } from "lucide-react";

interface Testimonial {
  id: string;
  student_name: string;
  review_text: string;
  rating: number;
  course_level: string | null;
  is_approved: boolean | null;
  created_at: string | null;
}

export function AdminTestimonials() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase.from("testimonials").update({ is_approved: true }).eq("id", id);
      if (error) throw error;
      toast({ title: "Testimonial Approved" });
      fetchTestimonials();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase.from("testimonials").update({ is_approved: false }).eq("id", id);
      if (error) throw error;
      toast({ title: "Testimonial Rejected" });
      fetchTestimonials();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Testimonial Deleted" });
      fetchTestimonials();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials</CardTitle>
        <CardDescription>Manage student reviews and testimonials</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-muted-foreground">No testimonials found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.student_name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{t.review_text}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {t.rating}
                    </div>
                  </TableCell>
                  <TableCell>{t.course_level || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={t.is_approved ? "default" : "secondary"}>
                      {t.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {!t.is_approved && (
                        <Button size="sm" variant="ghost" onClick={() => handleApprove(t.id)}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
                      {t.is_approved && (
                        <Button size="sm" variant="ghost" onClick={() => handleReject(t.id)}>
                          <XCircle className="w-4 h-4 text-orange-500" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
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
