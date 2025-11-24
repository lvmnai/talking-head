import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Suggestion {
  position: number;
  length: number;
  type: "engagement" | "cta" | "filler" | "other";
  message: string;
  severity: "low" | "medium" | "high";
}

interface TimingPhrase {
  text: string;
  seconds: number;
}

interface Analysis {
  suggestions: Suggestion[];
  timing: {
    totalSeconds: number;
    phrases: TimingPhrase[];
  };
}

interface ScenarioEditorProps {
  initialText: string;
  onSave: (text: string) => void;
}

export const ScenarioEditor = ({ initialText, onSave }: ScenarioEditorProps) => {
  const [text, setText] = useState(initialText);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  useEffect(() => {
    analyzeText();
  }, []);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-scenario', {
        body: { text }
      });

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast.error('Не удалось проанализировать текст');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500';
      case 'low': return 'bg-blue-500/10 text-blue-700 border-blue-500';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'engagement': return '💡';
      case 'cta': return '🎯';
      case 'filler': return '✂️';
      default: return '⚠️';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'engagement': return 'Вовлечённость';
      case 'cta': return 'Призыв к действию';
      case 'filler': return 'Вода';
      default: return 'Другое';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}м ${secs}с` : `${secs}с`;
  };

  const handleSave = () => {
    onSave(text);
    toast.success('Изменения сохранены');
  };

  return (
    <div className="space-y-6">
      {/* Timing Bar */}
      {analysis?.timing && (
        <div className="flex items-center gap-4 p-4 sketch-border bg-background/50">
          <Clock className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Время озвучки</span>
              <span className="text-lg font-bold">
                {formatTime(analysis.timing.totalSeconds)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  analysis.timing.totalSeconds <= 60 
                    ? 'bg-green-500' 
                    : analysis.timing.totalSeconds <= 90 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min((analysis.timing.totalSeconds / 120) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.timing.totalSeconds <= 60 
                ? '✓ Отлично для Reels/Shorts' 
                : analysis.timing.totalSeconds <= 90 
                ? '⚠️ Немного длинновато' 
                : '❌ Слишком длинный для короткого видео'}
            </p>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {analysis?.suggestions && analysis.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-подсказки</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {analysis.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSuggestion(idx === selectedSuggestion ? null : idx)}
                className={`w-full text-left p-3 sketch-border-light transition-all ${
                  idx === selectedSuggestion ? 'bg-primary/5' : 'bg-background hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{getTypeLabel(suggestion.type)}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSeverityColor(suggestion.severity)}`}
                      >
                        {suggestion.severity === 'high' ? 'Важно' : suggestion.severity === 'medium' ? 'Средне' : 'Совет'}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Редактор сценария</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[400px] font-sans text-sm leading-relaxed"
          placeholder="Редактируйте ваш сценарий..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={analyzeText}
          variant="outline"
          disabled={isAnalyzing}
          className="flex-1"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Анализируем...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Повторить анализ
            </>
          )}
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};
