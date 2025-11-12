import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScenarioFormNew from "@/components/ScenarioFormNew";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import verticalVideoSketch from "@/assets/vertical-video-sketch.png";
import horizontalVideoSketch from "@/assets/horizontal-video-sketch.png";
import aiFlowGif from "@/assets/ai-flow.gif";
import aiFlowStatic from "@/assets/ai-flow-static.png";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Index = () => {
  const hero = useScrollAnimation();
  const cards = useScrollAnimation();
  const inspiration = useScrollAnimation();
  const form = useScrollAnimation();
  const content = useScrollAnimation();
  const examples = useScrollAnimation();
  const faq = useScrollAnimation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiFlowOpen, setAiFlowOpen] = useState(false);
  const [showGif, setShowGif] = useState(true);

  const faqData = [
    {
      question: "Как это работает? И почему так хорошо?",
      answer: "Под капотом ИИ-агент из двух нейросетей: первая формирует задачу, вторая пишет сценарий. Главный секрет — в системных промптах, которые активируют глубинные знания и максимальные возможности нейросетей."
    },
    {
      question: "А какие там нейросети?",
      answer: "Gemini, Claude и ChatGPT, но в каком порядке и с какими промптами — секрет фирмы."
    },
    {
      question: "Надо ли мне что-то уметь? Я новичок",
      answer: "Сценарий готов к съёмке. Тебе нужно только включить камеру и начать говорить."
    },
    {
      question: "Можно ли редактировать сценарий?",
      answer: "Конечно, делай с ним что угодно. Нейросеть старалась для тебя."
    },
    {
      question: "А если мне не понравится?",
      answer: "Ты можешь отредактировать сценарий самостоятельно, либо генерить новые варианты у нас, либо пойти в чат с любой другой нейросетью и попросить её исправить то, что тебя не устраивает. Сервис со всеми нейросетями в одной подписке с прямым доступом за рубли — www.sabka.pro."
    },
    {
      question: "Кто это всё сделал?",
      answer: "Артем @starostin_creator — идея, промты, тесты сценариев. Влад @lvmnaboutAi — создал агента, подцепил нейронки и сделал сайт."
    },
    {
      question: "А если нам надо МНОГО сценариев?",
      answer: "Ок, пиши в личку в телегу @starosting или @lvmnaboutAi, придумаем что-нибудь."
    },
    {
      question: "А я хочу сам научиться писать такие промпты и запускать такие продукты!",
      answer: "Ок, пиши в личку в телегу @starosting или @lvmnaboutAi, придумаем что-нибудь."
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
            <div className="max-w-3xl mx-auto mb-16 space-y-6">
              <p className="text-xl md:text-2xl text-foreground leading-tight">
                Съёмка с первого дубля, без правок и редактуры
              </p>
              <p className="text-xl text-foreground/70 leading-tight">
                Сценарий готов к съёмке. Тебе нужно только включить камеру и начать говорить. Забудь про вдохновение и творческие муки. Пока другие думают, ты делаешь — сразу!
              </p>
            </div>
            
            <div ref={cards.ref} className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 scroll-fade-in ${cards.isVisible ? 'visible' : ''}`}>
              <div className="sketch-border p-6 card-hover scroll-fade-in-delay-1">
                <div className="flex justify-center mb-4">
                  <img src={verticalVideoSketch} alt="Вертикальное видео" className="w-32 h-auto" />
                </div>
                <h3 className="font-medium text-xl mb-3 text-foreground">TikTok, Shorts, Instagram (1 мин)</h3>
                <p className="text-foreground/70">Получишь 5 сценариев, по 3 креативных хука в каждом</p>
              </div>
              <div className="sketch-border p-6 card-hover scroll-fade-in-delay-2">
                <div className="flex justify-center mb-4">
                  <img src={horizontalVideoSketch} alt="Горизонтальное видео" className="w-48 h-auto" />
                </div>
                <h3 className="font-medium text-xl mb-3 text-foreground">YouTube, Дзен (до 20 мин)</h3>
                <p className="text-foreground/70">Получишь 3 заголовка, 3 идеи обложки и сценарий</p>
              </div>
            </div>

            {/* AI Flow Section */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div 
                className="cursor-pointer card-hover"
                onClick={() => {
                  setAiFlowOpen(true);
                  setShowGif(true);
                }}
              >
                <img 
                  src={aiFlowGif}
                  alt="Схема работы AI-агентов"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>

          <div ref={form.ref} className={`scroll-fade-in ${form.isVisible ? 'visible' : ''}`}>
            <ScenarioFormNew />
          </div>

          {/* Unique Value Proposition */}
          <div className="text-center mt-16 mb-8">
            <div className="sketch-border p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-medium mb-4 text-foreground">
                В чём отличие от любых других нейросетей и сервисов?
              </h3>
              <p className="text-lg text-foreground/70 leading-relaxed mb-4">
                Мы автоматизируем то, что умеем: 10 лет занимаемся маркетингом и написали тысячи сценариев и рекламных роликов. Поэтому наши промпты построены на принципах, которые работают в реальности, а не по книжкам.
              </p>
              <p className="text-xl font-medium text-foreground">
                Создай 1 сценарий бесплатно, убедишься.
              </p>
            </div>
          </div>
          
          <div ref={content.ref} className={`text-center mt-32 space-y-8 scroll-fade-in ${content.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl md:text-5xl font-medium text-foreground mb-6 leading-tight tracking-tight max-w-4xl mx-auto">
              Сделали всё за тебя. Превратили «надо подумать» в «снимаю сегодня». Тебе осталось только…
            </h2>
            <div className="flex flex-col items-start gap-4 text-xl md:text-2xl max-w-md mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 border-2 border-muted-foreground sketch-border-light flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <span className="line-through text-muted-foreground">Придумать</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 border-2 border-muted-foreground sketch-border-light flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <span className="line-through text-muted-foreground">Сформулировать</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 border-2 border-muted-foreground sketch-border-light flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <span className="line-through text-muted-foreground">Написать</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 border-2 border-muted-foreground sketch-border-light flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <span className="line-through text-muted-foreground">Оформить</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 border-2 border-foreground sketch-border-light"></div>
                <span className="text-foreground font-medium">Снять</span>
              </div>
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section className="container mx-auto px-6 sm:px-12 lg:px-16 py-16 mt-8">
          <div ref={examples.ref} className={`scroll-fade-in ${examples.isVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl md:text-6xl font-medium text-center mb-8 text-foreground tracking-tight leading-tight">
              Посмотри примеры
            </h2>
            <p className="text-center text-foreground/70 mb-16 max-w-3xl mx-auto text-lg leading-tight">
              У нас нейросети пишут на уровне лучших сценаристов и креаторов. Потому что мы сами такие
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { image: "/examples/example-1.png", alt: "Психологический стриптиз" },
              { image: "/examples/example-2.png", alt: "Нарушение сна" },
              { image: "/examples/example-3.png", alt: "Гenii воруют: секреты креатива Apple, Nike, Dyson" },
            ].map((item, index) => (
              <div
                key={index}
                className="card-hover bg-background cursor-pointer p-2"
                onClick={() => setSelectedImage(item.image)}
              >
                <img 
                  src={item.image} 
                  alt={item.alt}
                  className="w-full h-auto rounded-sm"
                />
              </div>
            ))}
          </div>
          
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
              {selectedImage && (
                <img 
                  src={selectedImage} 
                  alt="Увеличенный пример"
                  className="w-full h-auto"
                />
              )}
            </DialogContent>
          </Dialog>

          {/* AI Flow Dialog */}
          <Dialog open={aiFlowOpen} onOpenChange={() => setAiFlowOpen(false)}>
            <DialogContent className="max-w-6xl w-full p-4">
              <div className="relative">
                <img 
                  src={showGif ? aiFlowGif : aiFlowStatic}
                  alt="Схема работы AI-агентов"
                  className="w-full h-auto rounded-lg"
                />
                <button
                  onClick={() => setShowGif(!showGif)}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-background/90 hover:bg-background border border-border rounded-md text-sm font-medium transition-colors"
                >
                  {showGif ? "Показать скриншот" : "Показать анимацию"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
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
