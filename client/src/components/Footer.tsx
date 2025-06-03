import { Box } from "lucide-react";
import { SiDiscord, SiYoutube, SiX } from "react-icons/si";

export default function Footer() {
  const footerSections = [
    {
      title: "Training",
      links: ["PvP Training", "MLG Training", "Bridging", "Aim Training"],
    },
    {
      title: "Community",
      links: ["Discord", "Turniere", "Events", "Leaderboard"],
    },
    {
      title: "Support",
      links: ["Hilfe", "FAQ", "Kontakt", "Bug Report"],
    },
  ];

  const socialLinks = [
    { icon: SiDiscord, href: "#" },
    { icon: SiYoutube, href: "#" },
    { icon: SiX, href: "#" },
  ];

  return (
    <footer className="bg-[hsl(var(--dark-bg))] border-t border-[hsl(var(--dark-tertiary))] py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Box className="text-[hsl(var(--brand-orange))]" size={32} />
              <span className="text-xl font-bold text-gradient">KnockGames.eu</span>
            </div>
            <p className="text-gray-400 mb-4">
              Das ultimative Minecraft Training Netzwerk für ambitionierte Spieler.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-[hsl(var(--brand-orange))] transition-colors"
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="hover:text-[hsl(var(--brand-orange))] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[hsl(var(--dark-tertiary))] mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 KnockGames.eu - Alle Rechte vorbehalten. Nicht mit Mojang Studios verbunden.
          </p>
        </div>
      </div>
    </footer>
  );
}
