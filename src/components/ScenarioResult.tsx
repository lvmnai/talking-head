import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, X, ChevronDown, Edit3, Eye, Blocks } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportScenario, ExportFormat } from "@/lib/exportUtils";
import { ScenarioEditor } from "./ScenarioEditor";
import { BlockEditor } from "./BlockEditor";

interface ScenarioResultProps {
  scenario: string;
  onClose: () => void;
}

const ScenarioResult = ({ scenario, onClose }: ScenarioResultProps) => {
  const [editorMode, setEditorMode] = useState<"view" | "simple" | "blocks">("view");
  const [currentScenario, setCurrentScenario] = useState(scenario);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentScenario);
      toast.success("Сценарий скопирован в буфер обмена");
    } catch (error) {
      toast.error("Не удалось скопировать");
    }
  };

  const handleDownload = async (format: ExportFormat) => {
    try {
      await exportScenario(currentScenario, `${Date.now()}`, format);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-medium text-foreground mb-2">Ваш сценарий готов!</h2>
            <p className="text-foreground/70">
              {editorMode === "blocks" 
                ? 'Блочный редактор с AI-подсказками' 
                : editorMode === "simple"
                ? 'Простой редактор с анализом'
                : 'Можно сразу снимать'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setEditorMode(editorMode === "view" ? "simple" : "view")}
              variant="outline"
              size="sm"
            >
              {editorMode === "view" ? (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Простой редактор
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Просмотр
                </>
              )}
            </Button>
            <Button
              onClick={() => setEditorMode(editorMode === "blocks" ? "view" : "blocks")}
              variant={editorMode === "blocks" ? "default" : "outline"}
              size="sm"
            >
              <Blocks className="mr-2 h-4 w-4" />
              Блочный редактор
            </Button>
          </div>
        </div>
      </div>

      {editorMode === "blocks" ? (
        <BlockEditor
          initialText={currentScenario}
          onSave={(newText) => setCurrentScenario(newText)}
        />
      ) : editorMode === "simple" ? (
        <ScenarioEditor
          initialText={currentScenario}
          onSave={(newText) => setCurrentScenario(newText)}
        />
      ) : (
        <>
          <div className="sketch-border p-6 mb-8 max-h-96 overflow-y-auto">
            <pre className="text-foreground whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {currentScenario}
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
        </>
      )}
    </div>
  );
};

export default ScenarioResult;
