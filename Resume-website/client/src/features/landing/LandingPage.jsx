import Navbar from "../../components/layout/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import CTA from "./components/CTA";
import Footer from "../../components/layout/Footer";
import TemplatesSection from "../templates/components/TemplatesSection";
import FAQ from "./components/FAQ";
import FallingResumes from "./components/FallingResumes";
import Testimonials from "./components/Testimonials";
import BeforeAfterSlider from "./components/BeforeAfterSlider";

const LandingPage = () => (
  <div style={{ background: "var(--bg)" }} className="min-h-screen text-[var(--text)] relative overflow-hidden">
    <FallingResumes />
    <Navbar />
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <BeforeAfterSlider />
      <TemplatesSection />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
