import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Box } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "Training", id: "training" },
    { label: "Community", id: "community" },
    { label: "Kontakt", id: "contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-effect bg-[hsl(var(--dark-bg))/95]" : "glass-effect"
      } border-b border-[hsl(var(--dark-tertiary))]`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Box className="text-[hsl(var(--brand-orange))] text-2xl animate-bounce-slow" />
            <span className="text-2xl font-bold text-gradient">KnockGames.eu</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="hover:text-[hsl(var(--brand-orange))] transition-colors duration-300 font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white font-semibold transition-all duration-300 hover:animate-glow hidden sm:inline-flex"
              onClick={() => scrollToSection("contact")}
            >
              Jetzt Spielen
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white text-2xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[hsl(var(--dark-tertiary))]">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left hover:text-[hsl(var(--brand-orange))] transition-colors duration-300 font-medium"
                >
                  {item.label}
                </button>
              ))}
              <Button
                className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white font-semibold mt-4 w-full"
                onClick={() => scrollToSection("contact")}
              >
                Jetzt Spielen
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
