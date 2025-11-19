import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Tutors } from "@/components/Tutors";
import { About } from "@/components/About";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Tutors />
      <About />
      <CTA />
    </div>
  );
};

export default Index;
