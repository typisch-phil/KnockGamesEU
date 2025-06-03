import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Users, Server, Trophy, Clock } from "lucide-react";

export default function ServerStats() {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  const playerCount = useAnimatedCounter(1247, isIntersecting);
  const serverCount = useAnimatedCounter(12, isIntersecting);
  const tournamentCount = useAnimatedCounter(89, isIntersecting);

  const stats = [
    {
      icon: Users,
      count: playerCount,
      label: "Aktive Spieler",
    },
    {
      icon: Server,
      count: serverCount,
      label: "Training Server",
    },
    {
      icon: Trophy,
      count: tournamentCount,
      label: "Turniere",
    },
    {
      icon: Clock,
      count: "24/7",
      label: "Online",
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-[hsl(var(--dark-secondary))]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-[hsl(var(--dark-tertiary))] rounded-xl p-6 hover:bg-[hsl(var(--brand-orange))]/10 transition-all duration-300 hover:scale-105">
                <stat.icon className="text-[hsl(var(--brand-orange))] mx-auto mb-3" size={48} />
                <div className="text-3xl font-bold text-white">
                  {typeof stat.count === "string" ? stat.count : stat.count.toLocaleString()}
                </div>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
