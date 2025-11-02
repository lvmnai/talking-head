import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, FileDown, Printer } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const scenarioSchema = z.object({
  idea: z.string()
    .trim()
    .min(5, "Тема должна содержать минимум 5 символов")
    .max(500, "Тема не должна превышать 500 символов"),
  contentType: z.enum(["tiktok", "instagram", "youtube"], {
    errorMap: () => ({ message: "Выберите канал" })
  }),
  audience: z.string()
    .trim()
    .min(3, "Опишите вашу аудиторию (минимум 3 символа)")
    .max(200, "Описание аудитории не должно превышать 200 символов"),
});

const ScenarioForm = () => {
  const [idea, setIdea] = useState("");
  const [contentType, setContentType] = useState("");
  const [audience, setAudience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCopyText = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result);
      toast.success("Текст скопирован в буфер обмена!");
    } catch (error) {
      toast.error("Не удалось скопировать текст");
    }
  };

  const handleExportToFile = () => {
    if (!result) return;

    try {
      const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scenario.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Файл успешно скачан!");
    } catch (error) {
      toast.error("Не удалось экспортировать файл");
    }
  };

  const handlePrint = () => {
    if (!result) return;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Не удалось открыть окно печати");
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Сценарий</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                line-height: 1.6;
              }
              h1 {
                color: #333;
                margin-bottom: 20px;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: Arial, sans-serif;
              }
            </style>
          </head>
          <body>
            <h1>Сценарий</h1>
            <pre>${result}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (error) {
      toast.error("Не удалось открыть окно печати");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация полей
    const validationResult = scenarioSchema.safeParse({
      idea,
      contentType,
      audience,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log("Отправка запроса на backend:", {
        idea: validationResult.data.idea,
        contentType: validationResult.data.contentType,
        audience: validationResult.data.audience,
      });

      const { data, error } = await supabase.functions.invoke('generate-scenario', {
        body: {
          idea: validationResult.data.idea,
          contentType: validationResult.data.contentType,
          audience: validationResult.data.audience,
        },
      });

      if (error) {
        console.error("Ошибка при вызове функции:", error);
        throw new Error(error.message || "Ошибка при создании сценария");
      }

      console.log("Ответ от backend:", data);

      toast.success("Сценарий успешно создан!");
      setResult(data.scenario || data.result || JSON.stringify(data, null, 2));
      
      // Сброс формы
      setIdea("");
      setContentType("");
      setAudience("");
    } catch (error) {
      console.error("Ошибка при создании сценария:", error);
      toast.error(
        error instanceof Error 
          ? `Не удалось создать сценарий: ${error.message}` 
          : "Не удалось создать сценарий. Попробуйте еще раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
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

      {result && (
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-primary">Результат:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Копировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToFile}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Скачать .txt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Печать/PDF
              </Button>
            </div>
          </div>
          <div className="text-foreground whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
};

export default ScenarioForm;
