import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScenarioFormNew from "@/components/ScenarioFormNew";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import verticalVideoSketch from "@/assets/vertical-video-sketch.png";
import horizontalVideoSketch from "@/assets/horizontal-video-sketch.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const hero = useScrollAnimation();
  const cards = useScrollAnimation();
  const inspiration = useScrollAnimation();
  const form = useScrollAnimation();
  const content = useScrollAnimation();
  const examples = useScrollAnimation();
  const faq = useScrollAnimation();

  const faqData = [
    {
      question: "Кому подходит?",
      answer: "Психологам, коучам, экспертам, врачам, наставникам — всем, кто продаёт знания и услуги через соцсети. И кто устал от выгорания на этапе «придумать»"
    },
    {
      question: "А вы точно не накатали шаблонов, как все остальные «Neuro»?",
      answer: "Мы сами прошли путь от 10 до 50 миллионов просмотров в месяц. Знаем, что работает. Знаем, как это формулируется. И научили нейросеть делать так же"
    },
    {
      question: "Надо ли мне что-то уметь? Я новичок",
      answer: "Нужно уметь снимать видео на телефон. Или диктофон. Или веб-камеру. Всё остальное — в сценарии"
    },
    {
      question: "А если у меня ещё нет аудитории?",
      answer: "Начни с рилсов. С виральных сценариев. Наберёшь первую 1000 — перейдёшь на длинные форматы"
    },
    {
      question: "Можно ли редактировать сценарий?",
      answer: "Да. Но честно — если ты заполнил форму подробно, править почти не придётся. Проверено на 500+ запусках"
    },
    {
      question: "Что если мне не понравится?",
      answer: "Вернём деньги в течение 24 часов. Без вопросов"
    }
  ];

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
            
            <div ref={cards.ref} className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 scroll-fade-in ${cards.isVisible ? 'visible' : ''}`}>
              <div className="sketch-border p-12 card-hover scroll-fade-in-delay-1">
                <div className="flex justify-center mb-6">
                  <img src={verticalVideoSketch} alt="Вертикальное видео" className="w-32 h-auto" />
                </div>
                <h3 className="font-medium text-xl mb-4 text-foreground">TikTok, Shorts, Instagram (1 мин)</h3>
                <p className="text-foreground/70">Получишь 5 сценариев, по 3 креативных хука в каждом</p>
              </div>
              <div className="sketch-border p-12 card-hover scroll-fade-in-delay-2">
                <div className="flex justify-center mb-6">
                  <img src={horizontalVideoSketch} alt="Горизонтальное видео" className="w-48 h-auto" />
                </div>
                <h3 className="font-medium text-xl mb-4 text-foreground">YouTube, Дзен (до 20 мин)</h3>
                <p className="text-foreground/70">Получишь 3 заголовка, 3 идеи обложки и сценарий</p>
              </div>
            </div>
          </div>

          <div ref={inspiration.ref} className={`text-center mb-16 scroll-fade-in ${inspiration.isVisible ? 'visible' : ''}`}>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-tight">
              Забудь про вдохновение и творческие муки. Пока другие думают, ты делаешь. Сразу
            </p>
          </div>

          <div ref={form.ref} className={`scroll-fade-in ${form.isVisible ? 'visible' : ''}`}>
            <ScenarioFormNew />
          </div>
          
          <div ref={content.ref} className={`text-center mt-32 space-y-8 scroll-fade-in ${content.isVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl md:text-6xl font-medium text-foreground mb-12 leading-tight tracking-tight">
              Тебе осталось только…
            </h2>
            <div className="flex flex-col items-center gap-4 text-2xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-muted-foreground bg-muted-foreground"></div>
                <span className="line-through text-muted-foreground">Придумать</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-muted-foreground bg-muted-foreground"></div>
                <span className="line-through text-muted-foreground">Сформулировать</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-muted-foreground bg-muted-foreground"></div>
                <span className="line-through text-muted-foreground">Написать</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-muted-foreground bg-muted-foreground"></div>
                <span className="line-through text-muted-foreground">Оформить</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-foreground"></div>
                <span className="text-foreground font-medium">Снять</span>
              </div>
            </div>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto mt-12 leading-tight">
              Сделали всё за тебя. Превратили «надо подумать» в «снимаю сегодня»
            </p>
          </div>
        </section>

        {/* Examples Section */}
        <section className="container mx-auto px-6 sm:px-12 lg:px-16 py-16 mt-16">
          <div ref={examples.ref} className={`scroll-fade-in ${examples.isVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl md:text-6xl font-medium text-center mb-8 text-foreground tracking-tight leading-tight">
              Посмотри примеры
            </h2>
            <p className="text-center text-foreground/70 mb-16 max-w-3xl mx-auto text-lg leading-tight">
              У нас нейросети пишут на уровне лучших сценаристов и креаторов. Потому что мы сами такие
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {[
              { 
                title: "Продажи", 
                subtitle: "(остеопатия)", 
                desc: "Конвертируем просмотры в записи на приём",
                example: "Вход: Остеопат для женщин после родов\nРезультат: 5 рилсов с хуками про боль в спине + прямой призыв к записи"
              },
              { 
                title: "Виральность", 
                subtitle: "(психология)", 
                desc: "Миллионы просмотров и вовлечённая аудитория",
                example: "Вход: Психолог про токсичные отношения\nРезультат: Провокационный хук + эмоциональная история + 2M просмотров"
              },
              { 
                title: "Длинные, всё вместе", 
                subtitle: "(маркетинг)", 
                desc: "Продажи + охваты в одном видео",
                example: "Вход: Маркетолог про таргет\nРезультат: 15-минутный разбор кейса + структура + 3 идеи обложки"
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-left p-8 sketch-border card-hover"
              >
                <h3 className="text-2xl font-medium mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-foreground/60 mb-4">{item.subtitle}</p>
                <p className="text-foreground/70 mb-6">{item.desc}</p>
                <div className="bg-muted/30 p-4 rounded-none border border-border/30">
                  <p className="text-sm text-foreground/70 whitespace-pre-line leading-relaxed">{item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 sm:px-12 lg:px-16 py-24 mt-16">
          <div ref={faq.ref} className={`scroll-fade-in ${faq.isVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl md:text-6xl font-medium text-center mb-16 text-foreground tracking-tight leading-tight">
              Вопросы и ответы
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqData.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="sketch-border px-6">
                    <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/70 text-base leading-relaxed pt-2">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
