import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lightbulb, Info } from "lucide-react";
import ScenarioPreview from "./ScenarioPreview";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GENERATION_STEPS = [
  { label: "Анализируем вашу ЦА...", duration: 8 },
  { label: "Создаём структуру...", duration: 12 },
  { label: "Пишем текст...", duration: 20 },
  { label: "Полируем детали...", duration: 15 },
  { label: "Готово!", duration: 5 }
];

const TIPS = [
  "💡 Используйте конкретные примеры проблем вашей ЦА",
  "🎯 Чем детальнее описание продукта, тем точнее сценарий",
  "✨ Укажите возраст и интересы ЦА для лучшего попадания в тон",
  "🚀 Провокационный тон работает лучше для виральности"
];

const ScenarioFormNew = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [previewData, setPreviewData] = useState<{ preview: string; scenarioId: string } | null>(null);
  const [formData, setFormData] = useState({
    sphere: "",
    product: "",
    audience: "",
    problems: "",
    goal: "sales",
    tone: "friendly",
    format: "short",
  });

  const getCharCount = (text: string) => text.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sphere || !formData.product || !formData.audience || !formData.problems) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsLoading(true);
    setGenerationProgress(0);
    setCurrentStep(0);
    setCurrentTip(0);

    // Simulate progress through steps
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 1000);

    // Update steps
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < GENERATION_STEPS.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      }
    }, 12000);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 4000);

    try {
      const { data, error } = await supabase.functions.invoke("generate-scenario", {
        body: {
          sphere: formData.sphere,
          product: formData.product,
          audience: formData.audience,
          problems: formData.problems,
          goal: formData.goal,
          tone: formData.tone,
          format: formData.format,
        },
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(tipInterval);

      if (error) throw error;
      
      setGenerationProgress(100);
      setCurrentStep(GENERATION_STEPS.length - 1);
      
      if (data?.preview && data?.scenarioId) {
        setPreviewData({ preview: data.preview, scenarioId: data.scenarioId });
        toast.success("Сценарий успешно создан!");
      } else {
        throw new Error("Invalid response format");
      }
      
      setFormData({
        sphere: "",
        product: "",
        audience: "",
        problems: "",
        goal: "sales",
        tone: "friendly",
        format: "short",
      });
    } catch (error: any) {
      console.error("Error:", error);
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(tipInterval);
      toast.error(error.message || "Произошла ошибка при создании сценария");
    } finally {
      setIsLoading(false);
      setGenerationProgress(0);
      setCurrentStep(0);
    }
  };

  if (previewData) {
    return (
      <ScenarioPreview 
        preview={previewData.preview}
        scenarioId={previewData.scenarioId}
        onClose={() => setPreviewData(null)} 
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      {isLoading && (
        <div className="sketch-border p-8 mb-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">{GENERATION_STEPS[currentStep].label}</h3>
              <span className="text-sm text-muted-foreground">~{60 - Math.floor(generationProgress * 0.6)} сек</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-none animate-fade-in">
              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{TIPS[currentTip]}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="sketch-border p-6 md:p-12 transition-all duration-300">
        <div className="grid grid-cols-1 gap-6 mb-6">
          <TooltipProvider>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sphere" className="text-foreground">
                  Сфера <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Укажите конкретную нишу, в которой работаете. Это поможет создать более релевантный сценарий.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="sphere"
                placeholder="Например: остеопатия, работа с женщинами после родов, восстановление осанки и здоровья спины"
                value={formData.sphere}
                onChange={(e) => setFormData({ ...formData, sphere: e.target.value })}
                className="min-h-[100px]"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">{getCharCount(formData.sphere)} символов</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="product" className="text-foreground">
                  Продукт/услуга <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Подробно опишите ваш продукт или услугу, включая преимущества и результаты.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="product"
                placeholder="Например: индивидуальные сеансы остеопатии 60 минут, работа со всем телом, мягкие техники, помощь при болях в спине и шее"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="min-h-[100px]"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">{getCharCount(formData.product)} символов</p>
            </div>

          <div className="space-y-2">
            <Label htmlFor="product" className="text-foreground">
              Продукт/услуга <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="product"
              placeholder="чем подробней, тем лучше"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="min-h-[80px]"
              required
            />
          </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="audience" className="text-foreground">
                  ЦА <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Укажите пол, возраст, образ жизни, интересы и место проживания вашей ЦА.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="audience"
                placeholder="Например: женщины 25-45 лет, мамы с детьми до 3 лет, живут в крупных городах, следят за здоровьем, активны в соцсетях"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="min-h-[100px]"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">{getCharCount(formData.audience)} символов • Рекомендуем: 100+ символов</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="problems" className="text-foreground">
                  Проблемы ЦА <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Перечислите конкретные боли и проблемы, которые испытывает ваша ЦА.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="problems"
                placeholder="Например: боли в спине после родов, нарушение осанки от работы с ребенком, хроническая усталость, не хватает времени на себя"
                value={formData.problems}
                onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
                className="min-h-[100px]"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">{getCharCount(formData.problems)} символов</p>
            </div>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-2">
            <Label className="text-foreground">Цель</Label>
            <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Продажа</SelectItem>
                <SelectItem value="viral">Виральность</SelectItem>
                <SelectItem value="both">Всё вместе</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Тональность</Label>
            <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Дружелюбно</SelectItem>
                <SelectItem value="witty">Остроумно</SelectItem>
                <SelectItem value="provocative">Провокация</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Формат</Label>
            <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Вертикальные до 1 мин</SelectItem>
                <SelectItem value="long">Длинное до 20 мин</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full text-base md:text-lg py-4 md:py-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Создаём сценарий...
            </>
          ) : (
            <>
              Создать сценарий
              <span className="ml-2 opacity-70">• 400₽</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ScenarioFormNew;
