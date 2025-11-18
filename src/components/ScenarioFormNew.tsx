import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lightbulb, Info } from "lucide-react";
import ScenarioPreview from "./ScenarioPreview";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [previewData, setPreviewData] = useState<{ preview: string; scenarioId: string; isFree?: boolean; fullText?: string; format?: string } | null>(null);
  const [formData, setFormData] = useState({
    sphere: "",
    product: "",
    audience: "",
    problems: "",
    goal: "sales",
    tone: "friendly",
    format: "short",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasFreeScenario, setHasFreeScenario] = useState(false);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    
    if (session) {
      const { data: scenarios } = await supabase
        .from('scenarios')
        .select('is_free')
        .eq('user_id', session.user.id)
        .eq('is_free', true)
        .limit(1);
      
      setHasFreeScenario(scenarios && scenarios.length > 0);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Войдите через Google, чтобы создать сценарий");
      localStorage.setItem('pendingScenarioForm', JSON.stringify(formData));
      window.location.href = '/auth?redirect=/';
      return;
    }
    
    if (!formData.sphere || !formData.product || !formData.audience || !formData.problems) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    // Если уже есть бесплатный сценарий - создаем черновик и перенаправляем на оплату
    if (hasFreeScenario) {
      await handlePaidScenario(session);
      return;
    }

    // Генерируем бесплатный сценарий
    await generateFreeScenario(session);
  };

  const generateFreeScenario = async (session: any) => {
    setIsLoading(true);
    setGenerationProgress(0);
    setCurrentStep(0);
    setCurrentTip(0);

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
          is_free: true,
        },
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(tipInterval);

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Generate scenario response:', data);
      console.log('Response keys:', data ? Object.keys(data) : 'no data');
      
      setGenerationProgress(100);
      setCurrentStep(GENERATION_STEPS.length - 1);
      
      if (!data) {
        console.error('No data received from edge function');
        throw new Error("Пустой ответ от сервера");
      }
      
      if (!data.preview || data.preview.length === 0) {
        console.error('No preview in response. Data:', data);
        throw new Error("Не получен текст сценария");
      }
      
      if (!data.scenarioId) {
        console.error('No scenarioId in response. Data:', data);
        throw new Error("Не получен ID сценария");
      }
      
      console.log('Setting preview data with:', {
        previewLength: data.preview?.length,
        scenarioId: data.scenarioId,
        fullTextLength: data.fullText?.length,
        isFree: data.isFree
      });
      
      setPreviewData({ 
        preview: data.preview, 
        scenarioId: data.scenarioId,
        isFree: true,
        fullText: data.fullText,
        format: formData.format
      });
      toast.success("Бесплатный тестовый сценарий создан!");
      
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

  const handlePaidScenario = async (session: any) => {
    try {
      setIsLoading(true);
      
      // Создаем черновик сценария в БД
      const { data: scenarioData, error: scenarioError } = await supabase
        .from('scenarios')
        .insert({
          user_id: session.user.id,
          parameters: formData,
          preview_text: '',
          full_text: '',
          is_free: false,
          is_paid: false,
        })
        .select()
        .single();

      if (scenarioError) throw scenarioError;

      // Определяем цену в зависимости от формата
      const basePrice = formData.format === 'short' ? 499 : 399;

      // Создаем платеж
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-yookassa-payment', {
        body: {
          scenario_id: scenarioData.id,
          amount: basePrice,
          description: 'Оплата сценария',
          use_bonus: false
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (paymentError) throw paymentError;

      if (paymentData?.error) {
        toast.error(paymentData.error);
        return;
      }

      if (paymentData?.paid_with_bonus) {
        // Если оплачено бонусами - перенаправляем на страницу генерации
        navigate(`/payment/return?payment_id=bonus_${scenarioData.id}&scenario_id=${scenarioData.id}`);
        return;
      }

      if (paymentData?.payment_url) {
        window.location.href = paymentData.payment_url;
      } else {
        toast.error('Не удалось получить ссылку на оплату');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Произошла ошибка при создании платежа');
    } finally {
      setIsLoading(false);
    }
  };


  if (previewData) {
    return (
      <ScenarioPreview 
        preview={previewData.preview}
        scenarioId={previewData.scenarioId}
        isFree={previewData.isFree}
        fullText={previewData.fullText}
        format={previewData.format}
        onClose={() => {
          setPreviewData(null);
          checkAuth();
        }}
      />
    );
  }

  const buttonText = !hasFreeScenario 
    ? "СОЗДАТЬ БЕСПЛАТНО" 
    : formData.format === "short" 
      ? "СОЗДАТЬ 5 СЦЕНАРИЕВ ЗА 499 ₽" 
      : "СОЗДАТЬ СЦЕНАРИЙ ЗА 399 ₽";
  

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      {isLoading && (
        <div className="sketch-border p-8 mb-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">{hasFreeScenario ? "Создаем платеж..." : GENERATION_STEPS[currentStep].label}</h3>
              {!hasFreeScenario && <span className="text-sm text-muted-foreground">~{60 - Math.floor(generationProgress * 0.6)} сек</span>}
            </div>
            {!hasFreeScenario && (
              <>
                <Progress value={generationProgress} className="h-2" />
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-none animate-fade-in">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{TIPS[currentTip]}</p>
                </div>
              </>
            )}
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
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border z-50">
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
              <p className="text-xs text-muted-foreground">Рекомендуем: 50+ символов</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="product" className="text-foreground">
                  Продукт/услуга <span className="text-destructive">*</span>
                </Label>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border z-50">
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
              <p className="text-xs text-muted-foreground">Рекомендуем: 50+ символов</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="audience" className="text-foreground">
                  ЦА <span className="text-destructive">*</span>
                </Label>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border z-50">
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
              <p className="text-xs text-muted-foreground">Рекомендуем: 50+ символов</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="problems" className="text-foreground">
                  Проблемы ЦА <span className="text-destructive">*</span>
                </Label>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border z-50">
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
              <p className="text-xs text-muted-foreground">Рекомендуем: 50+ символов</p>
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
              <SelectContent className="bg-popover z-50">
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
              <SelectContent className="bg-popover z-50">
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
              <SelectContent className="bg-popover z-50">
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
          className="w-full text-base md:text-lg py-4 md:py-6 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Создаём сценарий...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>
    </form>
  );
};

export default ScenarioFormNew;
