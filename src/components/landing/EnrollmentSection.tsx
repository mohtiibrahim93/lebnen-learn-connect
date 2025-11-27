import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const EnrollmentSection = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studyCenter: "",
    courseLevel: "A1",
    preferredTutor: "None",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const enrollmentType =
        formData.courseLevel === "A1" || formData.courseLevel === "Trial"
          ? "Enrollment"
          : "Waiting List";

      const { error } = await supabase.from("enrollments").insert({
        name: formData.name,
        email: formData.email,
        study_center: formData.studyCenter,
        course_level: formData.courseLevel,
        preferred_tutor: formData.preferredTutor,
        message: formData.message,
        enrollment_type: enrollmentType,
      });

      if (error) throw error;

      toast({
        title: "Înscriere trimisă cu succes!",
        description: "Te vom contacta în curând.",
      });

      setFormData({
        name: "",
        email: "",
        studyCenter: "",
        courseLevel: "A1",
        preferredTutor: "None",
        message: "",
      });
    } catch (error: any) {
      console.error("Error submitting enrollment:", error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (formData.courseLevel === "A1" || formData.courseLevel === "Trial") {
      return `Status: Clasa ${formData.courseLevel} este disponibilă acum!`;
    }
    return `Status: Nivelul ${formData.courseLevel} este în lista de așteptare. Vă vom contacta când se deschide o clasă!`;
  };

  return (
    <section id="enrollment" className="py-16 sm:py-24 bg-primary">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-primary-foreground">
            Înscriere Curs Arabă Libaneză
          </h2>
          <p className="mt-4 text-xl text-primary-foreground/90">
            Completează formularul pentru a te înscrie, a te înscrie pe lista de așteptare sau pentru a solicita o lecție de probă gratuită.
          </p>
        </div>

        <div className="p-8 bg-card rounded-xl shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nume și Prenume *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Adresă Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="studyCenter">Centrul de Studiu *</Label>
              <Select
                value={formData.studyCenter}
                onValueChange={(value) => setFormData({ ...formData, studyCenter: value })}
                required
              >
                <SelectTrigger id="studyCenter">
                  <SelectValue placeholder="Selectează locația" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online Global">Online (Global)</SelectItem>
                  <SelectItem value="Bucharest, RO">București, RO (Clasă Fizică)</SelectItem>
                  <SelectItem value="Beirut, LB">Beirut, LB (Clasă Fizică)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="courseLevel">Nivel de Curs Dorit *</Label>
              <Select
                value={formData.courseLevel}
                onValueChange={(value) => setFormData({ ...formData, courseLevel: value })}
              >
                <SelectTrigger id="courseLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1 - Începător (Înscriere Imediată)</SelectItem>
                  <SelectItem value="A2">A2 - Intermediar Inferior (Lista de Așteptare)</SelectItem>
                  <SelectItem value="B1">B1 - Intermediar (Lista de Așteptare)</SelectItem>
                  <SelectItem value="B2">B2 - Intermediar Superior (Lista de Așteptare)</SelectItem>
                  <SelectItem value="C1">C1 - Avansat (Lista de Așteptare)</SelectItem>
                  <SelectItem value="C2">C2 - Masterat (Lista de Așteptare)</SelectItem>
                  <SelectItem value="Trial">Lecție de Probă Gratuită</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm font-semibold text-primary">{getStatusMessage()}</p>
            </div>

            {(formData.courseLevel === "A1" || formData.courseLevel === "Trial") && (
              <div>
                <Label htmlFor="tutor">Selectează Tutorul Preferat</Label>
                <Select
                  value={formData.preferredTutor}
                  onValueChange={(value) => setFormData({ ...formData, preferredTutor: value })}
                >
                  <SelectTrigger id="tutor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">Fără preferință</SelectItem>
                    <SelectItem value="Layla Khoury">Layla Khoury (Specializare: Conversație)</SelectItem>
                    <SelectItem value="Karim Youssef">Karim Youssef (Specializare: Gramatică & Cultură)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="message">Mesaj (Opțional)</Label>
              <Textarea
                id="message"
                rows={3}
                placeholder="Care sunt obiectivele tale de învățare?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-xl font-bold shadow-soft"
            >
              {loading ? (
                "Se trimite..."
              ) : (
                <>
                  <UserPlus className="w-6 h-6 mr-2" />
                  Înscrie-te
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
