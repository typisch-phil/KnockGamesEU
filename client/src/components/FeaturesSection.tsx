import { Sword, Target, BringToFront, Crosshair, Medal, Users } from "lucide-react";
import { Check } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Sword,
      title: "PvP Training",
      description: "Verbessere deine Kampffähigkeiten mit unserem fortschrittlichen PvP-Training-System.",
      items: ["1v1 Duelle", "FFA Arenen", "Combo Training", "Bot Training"],
    },
    {
      icon: Target,
      title: "MLG Training",
      description: "Meistere die schwierigsten MLG-Tricks und werde zum absoluten Pro-Spieler.",
      items: ["Water MLG", "Ladder MLG", "Block Clutch", "Advanced Tricks"],
    },
    {
      icon: BringToFront,
      title: "Bridging",
      description: "Lerne alle Bridging-Techniken von Anfänger bis zu Godbridge-Level.",
      items: ["Speed Bridging", "Ninja Bridging", "Godbridge", "Moonwalk"],
    },
    {
      icon: Crosshair,
      title: "Aim Training",
      description: "Perfektioniere dein Aim mit unseren spezialisierten Training-Modi.",
      items: ["Click Accuracy", "Tracking", "Flick Shots", "Bow Accuracy"],
    },
    {
      icon: Medal,
      title: "Ranking System",
      description: "Verfolge deinen Fortschritt mit unserem detaillierten Ranking-System.",
      items: ["ELO System", "Leaderboards", "Achievements", "Statistics"],
    },
    {
      icon: Users,
      title: "Community",
      description: "Werde Teil unserer aktiven und freundlichen Gaming-Community.",
      items: ["Discord Server", "Tournaments", "Events", "Support"],
    },
  ];

  return (
    <section id="features" className="py-20 bg-[hsl(var(--dark-bg))]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Unsere Features</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Entdecke die fortschrittlichsten Training-Tools und Features für deine Minecraft-Skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-[hsl(var(--dark-secondary))] rounded-xl p-8 hover:bg-[hsl(var(--dark-tertiary))] transition-all duration-300 hover:scale-105 minecraft-border">
                <div className="text-center mb-6">
                  <feature.icon className="text-[hsl(var(--brand-orange))] mx-auto mb-4" size={64} />
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                </div>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <ul className="text-gray-400 space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center">
                      <Check className="text-[hsl(var(--brand-orange))] mr-2 flex-shrink-0" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
