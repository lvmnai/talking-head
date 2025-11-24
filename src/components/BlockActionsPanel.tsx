import { useState } from "react";
import { Block } from "./BlockEditor";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sparkles,
  Minimize2,
  Maximize2,
  MessageCircle,
  Heart,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface BlockActionsPanelProps {
  block: Block;
  onUpdate: (content: string) => void;
}

export const BlockActionsPanel = ({ block, onUpdate }: BlockActionsPanelProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState("надежда");
  const [selectedTone, setSelectedTone] = useState("дружелюбный");

  const processBlock = async (action: string, context?: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-block', {
        body: { text: block.content, action, context }
      });

      if (error) throw error;

      if (action === 'regenerate') {
        setVariants(data.variants);
      } else if (data.result) {
        onUpdate(data.result);
        toast.success('Блок обновлён');
      }
    } catch (error) {
      console.error('Error processing block:', error);
      toast.error('Не удалось обработать блок');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="sketch-border p-4 space-y-4 bg-background">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Умные действия</h3>
      </div>

      <div className="space-y-2">
        <Button
          onClick={() => processBlock('regenerate')}
          disabled={isProcessing || !block.content}
          variant="outline"
          className="w-full justify-start"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Перегенерировать (5 вариантов)
        </Button>

        <Button
          onClick={() => processBlock('shorten')}
          disabled={isProcessing || !block.content}
          variant="outline"
          className="w-full justify-start"
        >
          <Minimize2 className="mr-2 h-4 w-4" />
          Сделать короче
        </Button>

        <Button
          onClick={() => processBlock('lengthen')}
          disabled={isProcessing || !block.content}
          variant="outline"
          className="w-full justify-start"
        >
          <Maximize2 className="mr-2 h-4 w-4" />
          Сделать длиннее
        </Button>

        <Button
          onClick={() => processBlock('add_question')}
          disabled={isProcessing || !block.content}
          variant="outline"
          className="w-full justify-start"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Добавить вопрос
        </Button>

        <div className="space-y-2">
          <label className="text-sm font-medium">Усилить эмоцию</label>
          <div className="flex gap-2">
            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="страх">Страх</SelectItem>
                <SelectItem value="надежда">Надежда</SelectItem>
                <SelectItem value="гнев">Гнев</SelectItem>
                <SelectItem value="удивление">Удивление</SelectItem>
                <SelectItem value="гордость">Гордость</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => processBlock('emotion', { emotion: selectedEmotion })}
              disabled={isProcessing || !block.content}
              size="icon"
              variant="outline"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Поменять тон</label>
          <div className="flex gap-2">
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="дружелюбный">Дружелюбный</SelectItem>
                <SelectItem value="авторитетный">Авторитетный</SelectItem>
                <SelectItem value="провокационный">Провокационный</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => processBlock('tone', { tone: selectedTone })}
              disabled={isProcessing || !block.content}
              size="icon"
              variant="outline"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium">Выберите вариант:</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {variants.map((variant, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onUpdate(variant);
                  setVariants([]);
                  toast.success('Вариант применён');
                }}
                className="w-full text-left p-3 text-sm sketch-border-light bg-background hover:bg-muted transition-colors"
              >
                <Badge variant="outline" className="mb-2">
                  Вариант {idx + 1}
                </Badge>
                <p className="line-clamp-3">{variant}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
