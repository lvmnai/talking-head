import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScenarioFormNew from "@/components/ScenarioFormNew";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-24">
          {/* Content */}
          <div className="relative z-10 container mx-auto px-8 sm:px-12 lg:px-16 max-w-5xl">
            <div className="text-center mb-20 animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-12 text-foreground tracking-tight leading-none">
                Живой сценарий говорящей головы за 2 минуты
              </h1>
              <p className="text-xl md:text-2xl text-foreground max-w-2xl mx-auto tracking-tight mb-16">
                Съёмка с первого дубля, без правок и редактуры
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
                <div className="sketch-border bg-background p-10">
                  <h3 className="font-medium text-lg mb-3 text-foreground tracking-tight">TikTok, Shorts, Instagram (1 мин)</h3>
                  <p className="text-foreground text-sm tracking-tight">Получишь 5 сценариев, по 3 креативных хука в каждом</p>
                </div>
                <div className="sketch-border bg-background p-10">
                  <h3 className="font-medium text-lg mb-3 text-foreground tracking-tight">YouTube, Дзен (до 20 мин)</h3>
                  <p className="text-foreground text-sm tracking-tight">Получишь 3 заголовка, 3 идеи обложки и сценарий</p>
                </div>
              </div>
            </div>

            <ScenarioFormNew />
            
            <div className="text-center mt-24 space-y-8 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-8 tracking-tight leading-none">
                Сделали всё за тебя. Превратили «надо подумать» в «снимаю сегодня»
              </h2>
              <p className="text-lg text-foreground mb-6 tracking-tight">Тебе осталось только…</p>
              <div className="flex flex-wrap justify-center gap-6 text-foreground">
                <span className="line-through tracking-tight">☑ Придумать</span>
                <span className="line-through tracking-tight">☑ Сформулировать</span>
                <span className="line-through tracking-tight">☑ Написать</span>
                <span className="line-through tracking-tight">☑ Оформить</span>
              </div>
              <p className="text-2xl font-medium text-foreground mt-8 tracking-tight">Снять</p>
              <p className="text-lg text-foreground max-w-2xl mx-auto mt-8 tracking-tight">
                Забудь про вдохновение и творческие муки. Пока другие думают, ты делаешь. Сразу
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-32 bg-background">
          <div className="container mx-auto px-8 sm:px-12 lg:px-16 max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-medium text-center mb-6 text-foreground tracking-tight leading-none">
              Посмотри примеры
            </h2>
            <p className="text-center text-foreground mb-16 max-w-2xl mx-auto tracking-tight">
              У нас нейросети пишут на уровне лучших сценаристов и креаторов. Потому что мы сами такие
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { title: "Продажи", subtitle: "(остеопатия)", desc: "Конвертируем просмотры в записи на приём" },
                { title: "Виральность", subtitle: "(психология)", desc: "Миллионы просмотров и вовлечённая аудитория" },
                { title: "Длинные, всё вместе", subtitle: "(маркетинг)", desc: "Продажи + охваты в одном видео" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center p-10 sketch-border bg-background animate-fade-in"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <h3 className="text-xl font-medium mb-2 text-foreground tracking-tight">{item.title}</h3>
                  <p className="text-sm text-foreground mb-4 tracking-tight">{item.subtitle}</p>
                  <p className="text-foreground text-sm tracking-tight">{item.desc}</p>
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
