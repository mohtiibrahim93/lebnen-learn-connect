import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AITutorSection = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast({
        title: "Eroare",
        description: "Te rugăm să introduci o întrebare.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { query: query.trim() },
      });

      if (error) throw error;

      setResponse(data.response);
    } catch (error: any) {
      console.error("Error calling AI tutor:", error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la generarea răspunsului.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="insight" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-foreground">
          ✨ Tutor Virtual (Asistență AI) ✨
        </h2>
        <p className="mt-4 text-xl text-center text-muted-foreground max-w-3xl mx-auto">
          Pune o întrebare despre cultura libaneză, istorie sau cere o traducere rapidă a unei fraze în dialect.
        </p>

        <div className="mt-8 p-6 bg-accent/10 rounded-xl border-2 border-accent text-sm text-foreground font-semibold">
          **Atenție:** Acest instrument folosește inteligența artificială pentru a genera răspunsuri în dialectul arab libanez. 
          Vă rugăm să rețineți că pot exista **inexactități** lingvistice sau culturale.
        </div>

        <div className="mt-6 p-6 bg-card rounded-xl shadow-soft border-2 border-primary/20 space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="Ex: Ce înseamnă 'Kifak'? sau Povestește-mi despre cedrii din Liban."
            className="w-full"
          />
          
          <div className="flex space-x-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generare...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Generează Răspuns</span>
                </>
              )}
            </Button>
          </div>

          {response && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold text-primary mb-2">Răspuns:</p>
              <div className="text-foreground whitespace-pre-wrap">{response}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
