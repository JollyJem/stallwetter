import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Features from "@/components/Features";
import AppPreview from "@/components/AppPreview";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <AppPreview />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
