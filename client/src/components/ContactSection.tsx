import { Button } from "@/components/ui/button";
import { Server, Headphones, Copy, HelpCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { Circle, Clock, Globe, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServerStatus } from "@/hooks/use-server-status";

export default function ContactSection() {
  const { toast } = useToast();
  const { data: serverStatus, isLoading } = useServerStatus();

  const copyServerIP = async () => {
    try {
      await navigator.clipboard.writeText("play.knockgames.eu");
      toast({
        title: "IP kopiert!",
        description: "Die Server-IP wurde in die Zwischenablage kopiert.",
      });
    } catch (err) {
      toast({
        title: "Fehler",
        description: "IP konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const contactCards = [
    {
      icon: Server,
      title: "Server Verbindung",
      content: (
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-sm">Server IP:</p>
            <p className="text-[hsl(var(--brand-orange))] font-mono text-lg font-bold">play.knockgames.eu</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Version:</p>
            <p className="text-white font-semibold">1.8.x - 1.20.x</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Status:</p>
            <p className="text-green-400 font-semibold flex items-center">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              Online
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: SiDiscord,
      title: "Discord Server",
      content: (
        <div>
          <p className="text-gray-300 mb-6">Trete unserem Discord bei für News, Events und Community-Chat.</p>
          <Button className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white font-semibold transition-colors">
            Discord Beitreten
          </Button>
        </div>
      ),
    },
    {
      icon: Headphones,
      title: "Support",
      content: (
        <div className="space-y-3 text-left">
          <div className="flex items-center">
            <Mail className="text-[hsl(var(--brand-orange))] mr-3 flex-shrink-0" size={16} />
            <span className="text-gray-300">support@knockgames.eu</span>
          </div>
          <div className="flex items-center">
            <Clock className="text-[hsl(var(--brand-orange))] mr-3 flex-shrink-0" size={16} />
            <span className="text-gray-300">24/7 Support</span>
          </div>
          <div className="flex items-center">
            <Globe className="text-[hsl(var(--brand-orange))] mr-3 flex-shrink-0" size={16} />
            <span className="text-gray-300">Deutsch & English</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="contact" className="py-20 bg-[hsl(var(--dark-secondary))]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Kontakt & Verbindung</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Alle Informationen um mit KnockGames.eu zu starten
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contactCards.map((card, index) => (
            <div key={index} className="bg-[hsl(var(--dark-bg))] rounded-xl p-8 text-center minecraft-border">
              <card.icon className="text-[hsl(var(--brand-orange))] mx-auto mb-4" size={64} />
              <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
              {card.content}
            </div>
          ))}
        </div>

        {/* Quick Connect Section */}
        <div className="mt-16 text-center">
          <div className="bg-[hsl(var(--dark-bg))] rounded-xl p-8 max-w-2xl mx-auto minecraft-border">
            <h3 className="text-2xl font-bold text-white mb-4">Schnell Verbinden</h3>
            <p className="text-gray-300 mb-6">Kopiere die Server-IP und füge sie in Minecraft ein:</p>
            <div className="bg-[hsl(var(--dark-tertiary))] rounded-lg p-4 font-mono text-[hsl(var(--brand-orange))] text-xl font-bold mb-6">
              play.knockgames.eu
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={copyServerIP}
                className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white font-semibold transition-colors"
              >
                <Copy className="mr-2" size={16} />
                IP Kopieren
              </Button>
              <Button
                variant="outline"
                className="border-2 border-[hsl(var(--brand-orange))] text-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange))] hover:text-white font-semibold transition-all"
              >
                <HelpCircle className="mr-2" size={16} />
                Hilfe beim Verbinden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
