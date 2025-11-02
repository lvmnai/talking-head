import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

const ScenarioForm = () => {
  const [idea, setIdea] = useState("");
  const [contentType, setContentType] = useState("");
  const [audience, setAudience] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea || !contentType || !audience) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://lvmnai.ru/webhook/dc2ac900-e689-4421-8f0f-cb4358f4f0a0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
          contentType,
          audience,
          mood: "creative",
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании сценария");
      }

      const result = await response.json();
      toast.success("Сценарий успешно создан!");
      console.log("Результат:", result);
      
      // Сброс формы
      setIdea("");
      setContentType("");
      setAudience("");
    } catch (error) {
      toast.error("Не удалось создать сценарий. Попробуйте еще раз.");
      console.error("Ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Введите тему или идею..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="h-14 text-lg bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={contentType} onValueChange={setContentType} disabled={isLoading}>
          <SelectTrigger className="h-14 bg-card/50 backdrop-blur-sm border-border">
            <SelectValue placeholder="Выберите канал" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="youtube">YouTube Shorts</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Кто ваша аудитория?"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="h-14 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground animate-glow"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Создаем сценарий...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Создать сценарий
          </>
        )}
      </Button>
    </form>
  );
};

export default ScenarioForm;
