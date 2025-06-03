import { Button } from "@/components/ui/button";
import { Play, Info, Gamepad2, Box } from "lucide-react";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen relative flex items-center justify-center parallax"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 15, 15, 0.7), rgba(15, 15, 15, 0.7)), url('https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--dark-bg))/20] to-[hsl(var(--dark-bg))]"></div>

      <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in">
        <div className="animate-float">
          <Gamepad2 className="text-[hsl(var(--brand-orange))] mx-auto mb-6" size={96} />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient animate-slide-up">
          KnockGames.eu
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
          Das ultimative Minecraft Training Netzwerk für ambitionierte Spieler. Verbessere deine Skills und werde zum Champion!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
          <Button
            size="lg"
            className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white font-semibold text-lg transition-all duration-300 hover:animate-glow hover:scale-105"
            onClick={() => scrollToSection("contact")}
          >
            <Play className="mr-2" size={20} />
            Server Beitreten
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-[hsl(var(--brand-orange))] text-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange))] hover:text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
            onClick={() => scrollToSection("features")}
          >
            <Info className="mr-2" size={20} />
            Mehr Erfahren
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          <p>
            Server IP: <span className="text-[hsl(var(--brand-orange))] font-mono">play.knockgames.eu</span>
          </p>
        </div>
      </div>

      {/* Floating Minecraft Elements */}
      <div className="absolute top-20 left-10 animate-float opacity-20" style={{ animationDelay: "1s" }}>
        <Box className="text-[hsl(var(--brand-orange))]" size={48} />
      </div>
      <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: "2s" }}>
        <Box className="text-[hsl(var(--brand-orange))]" size={64} />
      </div>
    </section>
  );
}
