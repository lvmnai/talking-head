import { Clock, Zap, Target, TrendingUp } from "lucide-react";
import { Badge } from "./ui/badge";

interface ScenarioStatsProps {
  stats: {
    readingTimeSeconds: number;
    emotionalTriggers: number;
    ctaStrength: number;
    retentionForecast: number;
    insights?: string;
  };
}

export const ScenarioStats = ({ stats }: ScenarioStatsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}м ${secs}с` : `${secs}с`;
  };

  const getScoreColor = (score: number, max: number = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="sketch-border p-4 space-y-4 bg-background">
      <h3 className="font-medium">Статистика сценария</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Время озвучки</span>
          </div>
          <Badge variant="outline" className={getScoreColor(stats.readingTimeSeconds, 120)}>
            {formatTime(stats.readingTimeSeconds)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Эмоц. триггеры</span>
          </div>
          <Badge variant="outline" className={getScoreColor(stats.emotionalTriggers)}>
            {stats.emotionalTriggers}%
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Сила CTA</span>
          </div>
          <Badge variant="outline" className={getScoreColor(stats.ctaStrength, 10)}>
            {stats.ctaStrength}/10
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Прогноз досмотра</span>
          </div>
          <Badge variant="outline" className={getScoreColor(stats.retentionForecast)}>
            {stats.retentionForecast}%
          </Badge>
        </div>
      </div>

      {stats.insights && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">{stats.insights}</p>
        </div>
      )}
    </div>
  );
};
