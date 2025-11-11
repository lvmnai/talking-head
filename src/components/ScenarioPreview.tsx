import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn, Loader2 } from "lucide-react";

interface ScenarioPreviewProps {
  preview: string;
  scenarioId: string;
  onClose: () => void;
}

const ScenarioPreview = ({ preview, scenarioId, onClose }: ScenarioPreviewProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/dashboard`);
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-yookassa-payment', {
        body: {
          scenario_id: scenarioId,
          amount: 400,
          description: 'Оплата сценария'
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        toast.error('Ошибка создания платежа');
        return;
      }

      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error('Не удалось получить ссылку на оплату');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Произошла ошибка при создании платежа');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="sketch-border-light p-8 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium tracking-tight">Превью сценария</h2>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        <div className="bg-muted/50 p-6 rounded-none mb-6 max-h-[1000px] overflow-y-auto">
          <p className="whitespace-pre-wrap text-base leading-relaxed">
            {preview}
            <span className="text-muted-foreground">...</span>
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mb-4 p-4 bg-muted/30 rounded-none border-2 border-border">
            <p className="text-sm text-muted-foreground">
              Войдите, чтобы сохранить сценарий в личном кабинете
            </p>
          </div>
        )}

        <div className="flex gap-4">
          {!isAuthenticated ? (
            <Button onClick={() => navigate("/auth?redirect=/dashboard")} size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Войти через Google
            </Button>
          ) : (
            <Button onClick={handlePayment} size="lg" disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание платежа...
                </>
              ) : (
                'Оплатить 400₽'
              )}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} size="lg">
            Создать новый сценарий
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioPreview;
