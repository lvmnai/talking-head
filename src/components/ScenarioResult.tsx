import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportScenario, ExportFormat } from "@/lib/exportUtils";

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

  const handleDownload = async (format: ExportFormat) => {
    try {
      await exportScenario(scenario, `${Date.now()}`, format);
      const formatNames = {
        txt: "TXT",
        pdf: "PDF",
        docx: "DOCX",
        md: "Markdown"
      };
      toast.success(`Сценарий сохранён как ${formatNames[format]}`);
    } catch (error) {
      toast.error("Не удалось сохранить файл");
      console.error(error);
    }
  };

  return (
    <div className="relative sketch-border p-12 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="mb-8">
        <h2 className="text-3xl font-medium text-foreground mb-2">Ваш сценарий готов!</h2>
        <p className="text-foreground/70">Можно сразу снимать</p>
      </div>

      <div className="sketch-border p-6 mb-8 max-h-96 overflow-y-auto">
        <pre className="text-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Скачать
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleDownload("txt")}>
              Скачать как TXT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("pdf")}>
              Скачать как PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("docx")}>
              Скачать как DOCX
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("md")}>
              Скачать как Markdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ScenarioResult;
