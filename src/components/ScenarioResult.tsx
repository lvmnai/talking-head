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
    <div className="sketch-border bg-background p-12 animate-fade-in max-w-3xl mx-auto">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="mb-8">
        <h2 className="text-3xl font-medium text-foreground mb-3 tracking-tight">Ваш сценарий готов!</h2>
        <p className="text-foreground tracking-tight">Можно сразу снимать</p>
      </div>

      <div className="bg-input border-2 border-border p-8 mb-8 max-h-96 overflow-y-auto">
        <pre className="text-foreground whitespace-pre-wrap font-sans text-sm tracking-tight leading-relaxed">
          {scenario}
        </pre>
      </div>

      <div className="flex gap-6">
        <Button
          onClick={handleCopy}
          className="flex-1"
        >
          <Copy className="mr-2 h-4 w-4" />
          Копировать
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Скачать .txt
        </Button>
      </div>
    </div>
  );
};

export default ScenarioResult;
