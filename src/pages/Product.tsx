import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Target, Lightbulb } from "lucide-react";

const Product = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Генерация идей",
      description: "Создавайте уникальные сценарии для ваших видео с помощью AI",
    },
    {
      icon: Zap,
      title: "Быстрый результат",
      description: "Получайте готовый сценарий за считанные секунды",
    },
    {
      icon: Target,
      title: "Точная настройка",
      description: "Адаптируйте контент под вашу целевую аудиторию",
    },
    {
      icon: Lightbulb,
      title: "Вдохновение",
      description: "Находите свежие идеи для творческого контента",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Инструменты для творчества
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Создавайте захватывающие сценарии для TikTok, Instagram и YouTube Shorts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Product;
