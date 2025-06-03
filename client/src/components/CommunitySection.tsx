import { Button } from "@/components/ui/button";
import { MessageCircle, Trophy, GraduationCap } from "lucide-react";
import { SiDiscord } from "react-icons/si";

export default function CommunitySection() {
  const features = [
    {
      icon: MessageCircle,
      title: "Discord Community",
      description: "Trete unserem aktiven Discord-Server bei und chatte mit über 5000 Spielern.",
    },
    {
      icon: Trophy,
      title: "Turniere & Events",
      description: "Nimm an wöchentlichen Turnieren teil und gewinne exklusive Preise.",
    },
    {
      icon: GraduationCap,
      title: "Mentoring Programm",
      description: "Lerne von den besten Spielern und verbessere deine Skills schneller.",
    },
  ];

  return (
    <section id="community" className="py-20 bg-[hsl(var(--dark-bg))]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Unsere Community</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Werde Teil einer leidenschaftlichen Gaming-Community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1580327344181-c1163234e5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Gaming community"
              className="rounded-xl shadow-2xl w-full"
            />
          </div>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-[hsl(var(--brand-orange))] rounded-full p-3 flex-shrink-0">
                  <feature.icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}

            <div className="pt-6">
              <Button
                size="lg"
                className="bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white font-semibold text-lg transition-all duration-300 hover:animate-glow"
              >
                <SiDiscord className="mr-2" size={20} />
                Discord Beitreten
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
