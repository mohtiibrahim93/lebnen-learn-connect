import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2 } from "lucide-react";

interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string | null;
  is_active: boolean | null;
}

export function AdminCenters() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<Center[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", city: "", description: "", is_active: true });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const { data, error } = await supabase.from("teaching_centers").select("*").order("name");
      if (error) throw error;
      setCenters(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCenter) {
        const { error } = await supabase
          .from("teaching_centers")
          .update(formData)
          .eq("id", editingCenter.id);
        if (error) throw error;
        toast({ title: "Center Updated" });
      } else {
        const { error } = await supabase.from("teaching_centers").insert(formData);
        if (error) throw error;
        toast({ title: "Center Created" });
      }
      setDialogOpen(false);
      setEditingCenter(null);
      setFormData({ name: "", address: "", city: "", description: "", is_active: true });
      fetchCenters();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (center: Center) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      address: center.address,
      city: center.city,
      description: center.description || "",
      is_active: center.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingCenter(null);
    setFormData({ name: "", address: "", city: "", description: "", is_active: true });
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Teaching Centers</CardTitle>
          <CardDescription>Manage physical learning locations</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" /> Add Center
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCenter ? "Edit Center" : "Add New Center"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>Active</Label>
              </div>
              <Button className="w-full" onClick={handleSubmit}>{editingCenter ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : centers.length === 0 ? (
          <p className="text-muted-foreground">No centers found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centers.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell>{center.city}</TableCell>
                  <TableCell className="text-muted-foreground">{center.address}</TableCell>
                  <TableCell>
                    <Badge variant={center.is_active ? "default" : "secondary"}>
                      {center.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(center)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
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
