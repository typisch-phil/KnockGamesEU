import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function TrainingPrograms() {
  const programs = [
    {
      title: "Anfänger",
      description: "Perfekt für Minecraft-Neulinge",
      features: ["Grundlagen des PvP", "Basic Bridging", "Aim Training", "Community Support"],
      buttonText: "Jetzt Starten",
      gradient: "from-green-400 to-blue-500",
      checkColor: "text-green-400",
      popular: false,
    },
    {
      title: "Fortgeschritten",
      description: "Für erfahrene Spieler",
      features: ["Advanced PvP Techniken", "Speed Bridging", "MLG Training", "1v1 Ranked Matches", "Personal Coach"],
      buttonText: "Jetzt Upgraden",
      gradient: "",
      checkColor: "text-[hsl(var(--brand-orange))]",
      popular: true,
    },
    {
      title: "Pro",
      description: "Für angehende Champions",
      features: ["Godbridge Training", "Advanced MLG", "Tournament Prep", "Elite Coaching", "VIP Status"],
      buttonText: "Pro Werden",
      gradient: "from-purple-400 to-pink-500",
      checkColor: "text-purple-400",
      popular: false,
    },
  ];

  return (
    <section id="training" className="py-20 bg-[hsl(var(--dark-secondary))]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Training Programme</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Wähle das perfekte Training-Programm für dein Skill-Level
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div key={index} className="group">
              <div
                className={`bg-[hsl(var(--dark-bg))] rounded-xl p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                  program.popular ? "border-2 border-[hsl(var(--brand-orange))]" : ""
                }`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    program.gradient ? `bg-gradient-to-r ${program.gradient}` : "bg-[hsl(var(--brand-orange))]"
                  }`}
                ></div>
                {program.popular && (
                  <div className="absolute -top-2 -right-2 bg-[hsl(var(--brand-orange))] text-white px-3 py-1 rounded-bl-lg text-sm font-bold">
                    BELIEBT
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-4">{program.title}</h3>
                <p className="text-gray-300 mb-6">{program.description}</p>
                <div className="space-y-3 mb-8">
                  {program.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className={`${program.checkColor} mr-3 flex-shrink-0`} size={16} />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full font-semibold transition-all ${
                    program.popular
                      ? "bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white hover:animate-glow"
                      : program.gradient
                      ? `bg-gradient-to-r ${program.gradient} text-white hover:opacity-90`
                      : `bg-gradient-to-r ${program.gradient} text-white hover:opacity-90`
                  }`}
                >
                  {program.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
