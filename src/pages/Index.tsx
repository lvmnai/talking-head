import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScenarioFormNew from "@/components/ScenarioFormNew";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Index = () => {
  const hero = useScrollAnimation();
  const cards = useScrollAnimation();
  const form = useScrollAnimation();
  const content = useScrollAnimation();
  const examples = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 sm:px-12 lg:px-16 py-24">
          <div ref={hero.ref} className={`text-center mb-20 scroll-fade-in ${hero.isVisible ? 'visible' : ''}`}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium mb-12 text-foreground tracking-tight leading-none">
              Живой сценарий говорящей головы за 2 минуты
            </h1>
            <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto leading-tight mb-16">
              Съёмка с первого дубля, без правок и редактуры
            </p>
            
            <div ref={cards.ref} className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24 scroll-fade-in ${cards.isVisible ? 'visible' : ''}`}>
              <div className="sketch-border p-12 card-hover scroll-fade-in-delay-1">
                <h3 className="font-medium text-xl mb-4 text-foreground">TikTok, Shorts, Instagram (1 мин)</h3>
                <p className="text-foreground/70">Получишь 5 сценариев, по 3 креативных хука в каждом</p>
              </div>
              <div className="sketch-border p-12 card-hover scroll-fade-in-delay-2">
                <h3 className="font-medium text-xl mb-4 text-foreground">YouTube, Дзен (до 20 мин)</h3>
                <p className="text-foreground/70">Получишь 3 заголовка, 3 идеи обложки и сценарий</p>
              </div>
            </div>
          </div>

          <div ref={form.ref} className={`scroll-fade-in ${form.isVisible ? 'visible' : ''}`}>
            <ScenarioFormNew />
          </div>
          
          <div ref={content.ref} className={`text-center mt-32 space-y-8 scroll-fade-in ${content.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl md:text-5xl font-medium text-foreground mb-12 leading-tight tracking-tight">
              Сделали всё за тебя. Превратили «надо подумать» в «снимаю сегодня»
            </h2>
            <p className="text-xl text-foreground/70 mb-8">Тебе осталось только…</p>
            <div className="flex flex-wrap justify-center gap-6 text-foreground/50">
              <span className="line-through">☑ Придумать</span>
              <span className="line-through">☑ Сформулировать</span>
              <span className="line-through">☑ Написать</span>
              <span className="line-through">☑ Оформить</span>
            </div>
            <p className="text-3xl font-medium text-foreground mt-12">Снять</p>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto mt-12 leading-tight">
              Забудь про вдохновение и творческие муки. Пока другие думают, ты делаешь. Сразу
            </p>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="container mx-auto px-6 sm:px-12 lg:px-16 py-24 mt-24">
          <div ref={examples.ref} className={`scroll-fade-in ${examples.isVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl md:text-6xl font-medium text-center mb-8 text-foreground tracking-tight leading-tight">
              Посмотри примеры
            </h2>
            <p className="text-center text-foreground/70 mb-20 max-w-3xl mx-auto text-lg leading-tight">
              У нас нейросети пишут на уровне лучших сценаристов и креаторов. Потому что мы сами такие
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {[
                { title: "Продажи", subtitle: "(остеопатия)", desc: "Конвертируем просмотры в записи на приём" },
                { title: "Виральность", subtitle: "(психология)", desc: "Миллионы просмотров и вовлечённая аудитория" },
                { title: "Длинные, всё вместе", subtitle: "(маркетинг)", desc: "Продажи + охваты в одном видео" },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`text-center p-12 sketch-border card-hover scroll-fade-in scroll-fade-in-delay-${index + 1}`}
                >
                  <h3 className="text-2xl font-medium mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-foreground/60 mb-4">{item.subtitle}</p>
                  <p className="text-foreground/70">{item.desc}</p>
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
