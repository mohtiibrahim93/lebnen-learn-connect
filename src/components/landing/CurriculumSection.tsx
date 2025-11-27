import { useState } from "react";
import { ChevronDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CurriculumLevel {
  id: string;
  title: string;
  objective: string;
  modules: string[];
}

const curriculumLevels: CurriculumLevel[] = [
  {
    id: "a1",
    title: "Nivel A1: Începător Absolut (Supraviețuire)",
    objective: "Să te poți prezenta, comanda mâncare și întreba direcții. Comprehensiune de bază în conversații lente.",
    modules: [
      "**Modul 1 (Salutări):** Formule esențiale (Marhaba, Kifak, Ma'asalaame), pronume personale, alfabetul opțional.",
      "**Modul 2 (Familia & Casa):** Vocabular de bază, verbul 'a avea' (fi'ndee), prepoziții de bază (fi, aala).",
      "**Modul 3 (Piața & Mâncarea):** Numere 1-100, culori, comandarea de preparate libaneze și negocierea de prețuri simple."
    ]
  },
  {
    id: "a2",
    title: "Nivel A2: Intermediar Inferior (Sarcini de Rutină)",
    objective: "Descrierea rutinei, evenimentelor trecute și planurilor viitoare. Capacitatea de a întreține discuții scurte despre subiecte familiare.",
    modules: [
      "**Modul 4 (Timpul & Verbele):** Conjugarea verbelor regulate la prezent și trecut, zilele săptămânii și orele.",
      "**Modul 5 (Călătorii & Transport):** Descrierea călătoriilor recente și solicitarea de informații despre transport public/taxiuri.",
      "**Modul 6 (Sănătate & Sentimente):** Exprimarea stării de bine/rău, vocabular medical de bază și conversații despre emoții."
    ]
  },
  {
    id: "b1",
    title: "Nivel B1: Intermediar (Independență)",
    objective: "Purtarea unor conversații mai complexe, înțelegerea punctelor principale din emisiuni radio sau știri simple. Exprimarea opiniilor și obiectivelor.",
    modules: [
      "**Modul 7 (Opinii & Argumente):** Exprimarea acordului/dezacordului și folosirea de conjuncții complexe (bass, la'anno).",
      "**Modul 8 (Media & Știri):** Vocabular specific pentru știri locale, discuții despre evenimente curente și diferențe dialectale.",
      "**Modul 9 (Cultura Libaneză Aprofundată):** Istorie, tradiții de nuntă, sărbători religioase și folclor."
    ]
  },
  {
    id: "b2",
    title: "Nivel B2: Intermediar Superior (Fluiditate)",
    objective: "Interacțiune fluentă și spontană cu vorbitori nativi. Înțelegerea textelor complexe din domenii de specialitate și susținerea unei prezentări clare.",
    modules: [
      "**Modul 10 (Nuanțe & Idiomuri):** Însușirea expresiilor idiomatice și a proverbelor libaneze.",
      "**Modul 11 (Business Arabic):** Vocabular și etichetă pentru mediul de afaceri, redactarea de emailuri formale simple.",
      "**Modul 12 (Subiecte Abstracte):** Discuții despre politică, economie și subiecte sociale complexe."
    ]
  },
  {
    id: "c1",
    title: "Nivel C1: Avansat (Competență Operațională Efectivă)",
    objective: "Folosirea limbii cu flexibilitate și eficiență. Înțelegerea textelor lungi și implicite. Producerea de texte structurate și detaliate.",
    modules: [
      "**Modul 13 (Analiză Critică):** Dezbateri pe teme controversate, exprimarea nuanțelor fine de semnificație.",
      "**Modul 14 (Literatură & Film):** Explorarea literaturii și a cinematografiei libaneze, analiză lingvistică a scenariilor.",
      "**Modul 15 (Adaptare la Alte Dialecte):** Introducere în diferențele cheie dintre dialectul libanez, sirian și iordanian."
    ]
  },
  {
    id: "c2",
    title: "Nivel C2: Masterat (Aproape Nativ)",
    objective: "Înțelegerea completă a limbii vorbite și scrise, rezumarea informațiilor din diverse surse și exprimarea spontană, fluentă și precisă.",
    modules: [
      "**Modul 16 (Domenii de Nișă):** Vocabular specializat (drept, medicină, IT) în context libanez.",
      "**Modul 17 (Tranzacții Lingvistice):** Traducere simultană și interpretare între română/engleză și arabă libaneză.",
      "**Modul 18 (Perfecționare):** Eliminarea micilor erori care ar putea indica lipsa de nativitate."
    ]
  }
];

export const CurriculumSection = ({ onEnroll }: { onEnroll: () => void }) => {
  const [openLevel, setOpenLevel] = useState<string>("a1");

  return (
    <section id="curriculum" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-foreground">
          Curriculum Lebanese Arabic (CEFR)
        </h2>
        <p className="mt-4 text-xl text-center text-muted-foreground max-w-3xl mx-auto">
          Structura noastră modulară, de la începător la fluent, te ghidează pas cu pas prin dialectul levantin.
        </p>

        <div className="mt-12 max-w-4xl mx-auto space-y-4">
          {curriculumLevels.map((level) => (
            <div key={level.id} className="bg-card rounded-xl shadow-soft overflow-hidden border border-border">
              <button
                onClick={() => setOpenLevel(openLevel === level.id ? "" : level.id)}
                className="w-full p-5 flex justify-between items-center hover:bg-muted/50 transition-colors"
              >
                <h3 className="text-2xl font-bold text-foreground text-left">{level.title}</h3>
                <ChevronDown 
                  className={`w-6 h-6 text-primary transition-transform duration-300 ${
                    openLevel === level.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div className={`transition-all duration-400 ${
                openLevel === level.id ? "max-h-[2000px] p-6" : "max-h-0 p-0"
              } overflow-hidden`}>
                <p className="mb-4 text-foreground font-semibold">Obiectiv: {level.objective}</p>
                <ul className="space-y-3 text-muted-foreground">
                  {level.modules.map((module, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-accent min-w-4 mt-1" />
                      <span dangerouslySetInnerHTML={{ __html: module }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button onClick={onEnroll} size="lg" className="px-8">
            Înscrie-te
          </Button>
        </div>
      </div>
    </section>
  );
};
