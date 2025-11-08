import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ScenarioPreview from "./ScenarioPreview";

const ScenarioFormNew = () => {
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sphere || !formData.product || !formData.audience || !formData.problems) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsLoading(true);

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

      if (error) throw error;
      
      // Extract preview and scenarioId from response
      if (data?.preview && data?.scenarioId) {
        setPreviewData({ preview: data.preview, scenarioId: data.scenarioId });
        toast.success("Сценарий успешно создан!");
      } else {
        throw new Error("Invalid response format");
      }
      
      // Reset form
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
      toast.error(error.message || "Произошла ошибка при создании сценария");
    } finally {
      setIsLoading(false);
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
      <div className="sketch-border p-12 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            <Label htmlFor="sphere" className="text-foreground">
              Сфера <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="sphere"
              placeholder="чем подробней, тем лучше"
              value={formData.sphere}
              onChange={(e) => setFormData({ ...formData, sphere: e.target.value })}
              className="min-h-[80px]"
              required
            />
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
            <Label htmlFor="audience" className="text-foreground">
              ЦА <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="audience"
              placeholder="чем подробней, тем лучше"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problems" className="text-foreground">
              Проблемы ЦА <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="problems"
              placeholder="чем подробней, тем лучше"
              value={formData.problems}
              onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
              className="min-h-[80px]"
              required
            />
          </div>
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
          className="w-full text-lg py-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Создаём сценарий...
            </>
          ) : (
            "Создать сценарий"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ScenarioFormNew;
