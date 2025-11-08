import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScenarioFormNew from "@/components/ScenarioFormNew";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background"></div>
          </div>

          {/* Stars Effect */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-accent rounded-full animate-twinkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                Живой сценарий говорящей головы за 2 минуты
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Съёмка с первого дубля, без правок и редактуры
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-card/40 backdrop-blur-sm border border-border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-foreground">TikTok, Shorts, Instagram (1 мин)</h3>
                  <p className="text-muted-foreground">Получишь 5 сценариев, по 3 креативных хука в каждом</p>
                </div>
                <div className="bg-card/40 backdrop-blur-sm border border-border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-foreground">YouTube, Дзен (до 20 мин)</h3>
                  <p className="text-muted-foreground">Получишь 3 заголовка, 3 идеи обложки и сценарий</p>
                </div>
              </div>
            </div>

            <ScenarioFormNew />
            
            <div className="text-center mt-12 space-y-4 animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Сделали всё за тебя. Превратили «надо подумать» в «снимаю сегодня»
              </h2>
              <p className="text-lg text-muted-foreground mb-4">Тебе осталось только…</p>
              <div className="flex flex-wrap justify-center gap-4 text-muted-foreground">
                <span className="line-through">☑ Придумать</span>
                <span className="line-through">☑ Сформулировать</span>
                <span className="line-through">☑ Написать</span>
                <span className="line-through">☑ Оформить</span>
              </div>
              <p className="text-2xl font-bold text-primary mt-4">Снять</p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
                Забудь про вдохновение и творческие муки. Пока другие думают, ты делаешь. Сразу
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-gradient-to-b from-background to-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
              Посмотри примеры
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              У нас нейросети пишут на уровне лучших сценаристов и креаторов. Потому что мы сами такие
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { title: "Продажи", subtitle: "(остеопатия)", desc: "Конвертируем просмотры в записи на приём" },
                { title: "Виральность", subtitle: "(психология)", desc: "Миллионы просмотров и вовлечённая аудитория" },
                { title: "Длинные, всё вместе", subtitle: "(маркетинг)", desc: "Продажи + охваты в одном видео" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center p-8 bg-card/50 backdrop-blur-sm border border-border rounded-lg hover:border-primary transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <h3 className="text-2xl font-bold mb-1 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.subtitle}</p>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
