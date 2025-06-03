import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServerStats from "@/components/ServerStats";
import FeaturesSection from "@/components/FeaturesSection";
import TrainingPrograms from "@/components/TrainingPrograms";
import CommunitySection from "@/components/CommunitySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(var(--dark-bg))] text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <ServerStats />
      <FeaturesSection />
      <TrainingPrograms />
      <CommunitySection />
      <ContactSection />
      <Footer />
    </div>
  );
}
