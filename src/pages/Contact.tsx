import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Свяжитесь с нами
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-12">
              Есть вопросы или предложения? Напишите нам!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Имя
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  className="bg-background/50 border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="bg-background/50 border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Сообщение
                </label>
                <Textarea
                  id="message"
                  placeholder="Расскажите нам..."
                  className="bg-background/50 border-border min-h-[150px]"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Отправить сообщение
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
