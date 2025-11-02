import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              О Lunora
            </h1>
            
            <div className="prose prose-invert max-w-none space-y-6 text-foreground">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Lunora — это пространство, где идеи расцветают под звёздами. Мы создали инструмент для тех, кто думает, мечтает и создает контент.
              </p>

              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8 my-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Наша миссия</h2>
                <p className="text-muted-foreground">
                  Помочь креаторам находить вдохновение и создавать уникальный контент. Мы верим, что каждая идея заслуживает быть воплощённой, и наша технология делает этот процесс простым и вдохновляющим.
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8 my-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Как мы работаем</h2>
                <p className="text-muted-foreground">
                  Используя передовые технологии искусственного интеллекта, мы анализируем ваши идеи и создаем персонализированные сценарии для видео контента. Наш подход учитывает специфику каждой платформы и целевую аудиторию.
                </p>
              </div>

              <div className="text-center mt-12">
                <p className="text-lg text-accent">
                  Присоединяйтесь к сообществу креаторов, которые творят под звёздами ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
