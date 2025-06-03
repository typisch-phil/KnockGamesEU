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
      className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Animated Orange Dots Background */}
      <div className="absolute inset-0">
        {/* Large floating dots */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[hsl(var(--brand-orange))] rounded-full animate-pulse-orange" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-[hsl(var(--brand-orange))] rounded-full animate-float-slow" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-1/3 left-1/6 w-3 h-3 bg-[hsl(var(--brand-orange))] rounded-full animate-pulse-orange" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-[hsl(var(--brand-orange))] rounded-full animate-float-slow" style={{ animationDelay: "3s" }}></div>
        <div className="absolute bottom-1/4 right-1/6 w-2 h-2 bg-[hsl(var(--brand-orange))] rounded-full animate-pulse-orange" style={{ animationDelay: "4s" }}></div>
        
        {/* Medium dots */}
        <div className="absolute top-1/5 left-1/2 w-3 h-3 bg-[hsl(var(--brand-orange))] rounded-full animate-float-slow opacity-70" style={{ animationDelay: "1.5s" }}></div>
        <div className="absolute bottom-1/2 left-1/3 w-4 h-4 bg-[hsl(var(--brand-orange))] rounded-full animate-pulse-orange opacity-60" style={{ animationDelay: "2.5s" }}></div>
        <div className="absolute top-3/4 right-1/2 w-2 h-2 bg-[hsl(var(--brand-orange))] rounded-full animate-float-slow opacity-80" style={{ animationDelay: "3.5s" }}></div>
        
        {/* Small dots */}
        <div className="absolute top-2/3 left-1/5 w-1 h-1 bg-[hsl(var(--brand-orange))] rounded-full animate-pulse-orange opacity-50" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute bottom-1/5 right-1/5 w-1 h-1 bg-[hsl(var(--brand-orange))] rounded-full animate-float-slow opacity-60" style={{ animationDelay: "1.8s" }}></div>
        <div className="absolute top-1/6 right-2/3 w-2 h-2 bg-[hsl(var(--brand-orange))] rounded-full animate-pulse-orange opacity-40" style={{ animationDelay: "2.8s" }}></div>
        <div className="absolute bottom-2/3 left-2/3 w-1 h-1 bg-[hsl(var(--brand-orange))] rounded-full animate-float-slow opacity-70" style={{ animationDelay: "3.8s" }}></div>
        
        {/* Drifting dots */}
        <div className="absolute top-1/4 w-2 h-2 bg-[hsl(var(--brand-orange))] rounded-full animate-drift opacity-30" style={{ animationDelay: "0s", animationDuration: "20s" }}></div>
        <div className="absolute top-1/2 w-1 h-1 bg-[hsl(var(--brand-orange))] rounded-full animate-drift opacity-40" style={{ animationDelay: "5s", animationDuration: "25s" }}></div>
        <div className="absolute top-3/4 w-3 h-3 bg-[hsl(var(--brand-orange))] rounded-full animate-drift opacity-20" style={{ animationDelay: "10s", animationDuration: "30s" }}></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[hsl(var(--dark-bg))]"></div>

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
