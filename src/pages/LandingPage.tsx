import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Globe, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { LebaneseFlag } from "@/components/LebaneseFlag";
import { CurriculumSection } from "@/components/landing/CurriculumSection";
import { AITutorSection } from "@/components/landing/AITutorSection";
import { EnrollmentSection } from "@/components/landing/EnrollmentSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import heroImage from "@/assets/hero-lebanese.jpg";

export default function LandingPage() {
  const enrollmentRef = useRef<HTMLDivElement>(null);

  const scrollToEnrollment = () => {
    enrollmentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header & Navigation */}
      <header className="bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center space-x-2">
            <div className="text-3xl font-extrabold text-primary">لبنان</div>
            <span className="text-xl font-bold text-foreground">Centrul de Arabă Libaneză</span>
          </a>
          <nav className="hidden md:flex space-x-8">
            <a href="#whyus" className="text-muted-foreground hover:text-primary transition duration-200">De Ce Noi</a>
            <a href="#curriculum" className="text-muted-foreground hover:text-primary transition duration-200">Curriculum</a>
            <a href="#perspective" className="text-muted-foreground hover:text-primary transition duration-200">Perspective</a>
            <a href="#insight" className="text-muted-foreground hover:text-primary transition duration-200">Tutor Virtual</a>
            <a href="#enrollment" className="text-muted-foreground hover:text-primary transition duration-200 font-semibold">Înscrie-te</a>
          </nav>
          <Button onClick={scrollToEnrollment} className="hidden md:block">
            Înscrie-te
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="bg-muted/30 py-16 sm:py-24 rounded-b-2xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground leading-tight">
                Vorbește <span className="text-primary">Dialectul Libanez.</span>
              </h1>
              <p className="mt-4 text-xl text-muted-foreground max-w-lg mx-auto md:mx-0">
                Învață **Illahje Illebneniyye** (Araba Libaneză) cu tutori nativi. De la conversații esențiale la fluență culturală, 
                începe să vorbești ca un localnic în câteva săptămâni.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Button onClick={scrollToEnrollment} size="lg" className="px-8">
                  Înscrie-te
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  <a href="#curriculum">Vezi Curriculum</a>
                </Button>
              </div>
            </div>
            <div className="relative mt-10 md:mt-0 flex flex-col items-center">
              <LebaneseFlag />
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="whyus" className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-foreground">
            De Ce Noi?
          </h2>
          <p className="mt-4 text-xl text-center text-muted-foreground">
            O metodă de predare bazată pe experiența reală, nu doar pe cărți.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-elevated hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <MessageCircle className="w-12 h-12 mb-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                <CardTitle>Conversație Imediată</CardTitle>
                <CardDescription>
                  80% din timp este dedicat practicii vorbirii. Învață fluxul natural al dialectului libanez pentru a comunica eficient din prima zi.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-elevated hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <Globe className="w-12 h-12 mb-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                <CardTitle>Tutori Nativi, Certificați</CardTitle>
                <CardDescription>
                  Învață direct de la profesori pasionați, născuți și crescuți în Liban, asigurând pronunția și contextul cultural autentic.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-elevated hover:border-primary/50 transition-all duration-300">
              <CardHeader>
                <Calendar className="w-12 h-12 mb-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                <CardTitle>Flexibilitate Totală</CardTitle>
                <CardDescription>
                  Fie că preferi sesiuni private 1-la-1 sau cursuri în grup mic, oferim programe care se potrivesc perfect orarului tău încărcat.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button onClick={scrollToEnrollment} size="lg">
              Înscrie-te
            </Button>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <CurriculumSection onEnroll={scrollToEnrollment} />

      {/* Perspective Section */}
      <section id="perspective" className="py-16 sm:py-24 bg-card">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <TrendingUp className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">
            O Perspectivă Mai Largă
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            În Liban, limba este poarta către o istorie milenară și o cultură vibrantă. Viziunea noastră depășește simpla traducere; este despre conexiune.
          </p>
          
          <div className="mt-8 space-y-4 text-left p-6 bg-muted/30 rounded-xl">
            <p className="flex items-start space-x-3 text-lg font-semibold text-foreground">
              <BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <span>Conexiunea cu Moștenirea: Descoperă-ți rădăcinile sau înțelege mai bine prietenii și partenerii de viață libanezi. Dialectul libanez este o limbă a familiei.</span>
            </p>
            <p className="flex items-start space-x-3 text-lg font-semibold text-foreground">
              <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <span>Oportunități Profesionale: Dialectul levantin este esențial pentru afacerile din Orientul Mijlociu și diaspora, fiind des folosit ca *lingua franca* informală în regiune.</span>
            </p>
            <p className="flex items-start space-x-3 text-lg font-semibold text-foreground">
              <MessageCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <span>Fluență Autentică: Vei învăța expresiile și nuanțele folosite zilnic, evitând formalismul limbii arabe standard (MSA), concentrându-te pe comunicarea reală.</span>
            </p>
          </div>

          <Button onClick={scrollToEnrollment} size="lg" className="mt-8">
            Înscrie-te
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* AI Tutor Section */}
      <AITutorSection />

      {/* Enrollment Section */}
      <div ref={enrollmentRef}>
        <EnrollmentSection />
      </div>

      {/* Footer */}
      <footer className="bg-foreground/95 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-primary-foreground text-center">
          <div className="text-xl font-bold text-primary mb-3">Centrul de Arabă Libaneză</div>
          <p className="text-muted-foreground">&copy; 2025 Centrul de Arabă Libaneză. Toate drepturile rezervate. Specializat în Dialecte Levantului.</p>
          <div className="mt-4 space-x-4 text-sm">
            <a href="mailto:info@lebanesecenter.com" className="text-muted-foreground hover:text-primary transition duration-200">Contact Email</a>
            <span className="text-border">|</span>
            <a href="#whyus" className="text-muted-foreground hover:text-primary transition duration-200">De Ce Noi</a>
            <span className="text-border">|</span>
            <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition duration-200">(555) 123-4567</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
