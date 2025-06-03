import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useServerStatus } from "@/hooks/use-server-status";
import { Users, Server, Trophy, Clock, Wifi, WifiOff } from "lucide-react";

export default function ServerStats() {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  const { data: serverStatus, isLoading, error } = useServerStatus();

  const playerCount = useAnimatedCounter(
    serverStatus?.players?.online || 0, 
    isIntersecting
  );
  const maxPlayers = serverStatus?.players?.max || 0;
  const serverCount = useAnimatedCounter(12, isIntersecting);
  const tournamentCount = useAnimatedCounter(89, isIntersecting);

  const stats = [
    {
      icon: Users,
      count: isLoading ? "..." : `${playerCount}${maxPlayers > 0 ? `/${maxPlayers}` : ""}`,
      label: "Aktive Spieler",
      status: serverStatus?.online,
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
      icon: serverStatus?.online ? Wifi : WifiOff,
      count: serverStatus?.online ? "Online" : (isLoading ? "..." : "Offline"),
      label: serverStatus?.ping ? `${serverStatus.ping}ms` : "Status",
      status: serverStatus?.online,
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-[hsl(var(--dark-secondary))]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`bg-[hsl(var(--dark-tertiary))] rounded-xl p-6 hover:bg-[hsl(var(--brand-orange))]/10 transition-all duration-300 hover:scale-105 ${
                stat.status === false ? 'border border-red-500/30' : stat.status === true ? 'border border-green-500/30' : ''
              }`}>
                <stat.icon 
                  className={`mx-auto mb-3 ${
                    stat.status === false ? 'text-red-500' : 
                    stat.status === true ? 'text-green-500' : 
                    'text-[hsl(var(--brand-orange))]'
                  }`} 
                  size={48} 
                />
                <div className={`text-3xl font-bold ${
                  stat.status === false ? 'text-red-400' : 
                  stat.status === true ? 'text-green-400' : 
                  'text-white'
                }`}>
                  {typeof stat.count === "string" ? stat.count : stat.count.toLocaleString()}
                </div>
                <p className="text-gray-400 font-medium">{stat.label}</p>
                {error && index === 0 && (
                  <p className="text-red-400 text-xs mt-1">Failed to connect</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
