import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, X } from "lucide-react";
import { toast } from "sonner";

interface ScenarioResultProps {
  scenario: string;
  onClose: () => void;
}

const ScenarioResult = ({ scenario, onClose }: ScenarioResultProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scenario);
      toast.success("Сценарий скопирован в буфер обмена");
    } catch (error) {
      toast.error("Не удалось скопировать");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([scenario], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scenario-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Сценарий сохранён");
    } catch (error) {
      toast.error("Не удалось сохранить файл");
    }
  };

  return (
    <Card className="relative bg-card/80 backdrop-blur-sm border-border p-8 animate-fade-in">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 hover:bg-muted"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Ваш сценарий готов!</h2>
        <p className="text-muted-foreground">Можно сразу снимать</p>
      </div>

      <div className="bg-background/50 border border-border rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        <pre className="text-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {scenario}
        </pre>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleCopy}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Copy className="mr-2 h-4 w-4" />
          Копировать
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1 border-border hover:bg-muted"
        >
          <Download className="mr-2 h-4 w-4" />
          Скачать .txt
        </Button>
      </div>
    </Card>
  );
};

export default ScenarioResult;
