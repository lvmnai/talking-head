import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn, Loader2, FileText, Clock, Video } from "lucide-react";

interface ScenarioPreviewProps {
  preview: string;
  scenarioId: string;
  onClose: () => void;
}

const getWordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
const getReadingTime = (wordCount: number) => Math.ceil(wordCount / 200); // 200 words per minute
const getVideoTime = (wordCount: number) => Math.ceil(wordCount / 150); // ~150 words per minute for speech

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
      // Получаем сессию для передачи access_token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Необходимо войти в систему');
        navigate('/auth?redirect=/dashboard');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-yookassa-payment', {
        body: {
          scenario_id: scenarioId,
          amount: 10,
          description: 'Оплата сценария'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        toast.error(error.message || 'Ошибка создания платежа');
        return;
      }

      if (data?.error) {
        console.error('Payment API error:', data.error);
        toast.error(data.error);
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

  const wordCount = getWordCount(preview);
  const readingTime = getReadingTime(wordCount);
  const videoTime = getVideoTime(wordCount);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="sketch-border-light p-6 md:p-8 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-medium tracking-tight">Превью сценария</h2>
          <Button variant="ghost" onClick={onClose} size="sm">
            Закрыть
          </Button>
        </div>

        {/* Statistics */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {wordCount} слов
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ~{readingTime} мин чтения
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            ~{videoTime} мин видео
          </Badge>
        </div>

        <div className="bg-muted/50 p-4 md:p-6 rounded-none mb-6 max-h-[600px] md:max-h-[800px] overflow-y-auto">
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed" style={{ lineHeight: '1.6' }}>
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

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {!isAuthenticated ? (
            <Button onClick={() => navigate("/auth?redirect=/dashboard")} size="lg" className="w-full sm:w-auto">
              <LogIn className="mr-2 h-4 w-4" />
              Войти через Google
            </Button>
          ) : (
            <Button onClick={handlePayment} size="lg" disabled={isProcessingPayment} className="w-full sm:w-auto payment-pulse">
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание платежа...
                </>
              ) : (
                'Оплатить 10₽'
              )}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} size="lg" className="w-full sm:w-auto">
            Создать новый сценарий
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioPreview;
