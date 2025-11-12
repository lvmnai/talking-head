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
  isFree?: boolean;
  fullText?: string;
}

interface BonusBalance {
  balance: number;
  user_id: string;
}

interface Referral {
  status: string;
  first_payment_at: string | null;
}

const getWordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
const getReadingTime = (wordCount: number) => Math.ceil(wordCount / 200); // 200 words per minute
const getVideoTime = (wordCount: number) => Math.ceil(wordCount / 150); // ~150 words per minute for speech

const ScenarioPreview = ({ preview, scenarioId, onClose, isFree = false, fullText }: ScenarioPreviewProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [useBonus, setUseBonus] = useState(false);
  const [isReferral, setIsReferral] = useState(false);
  const basePrice = 10;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    
    if (session) {
      // Получаем баланс бонусов
      const { data: bonusData } = await supabase
        .from('bonus_balance')
        .select('balance')
        .eq('user_id', session.user.id)
        .single();
      
      if (bonusData) {
        setBonusBalance(bonusData.balance);
      }

      // Проверяем является ли пользователь приглашенным
      const { data: referralData } = await supabase
        .from('referrals')
        .select('status, first_payment_at')
        .eq('referred_id', session.user.id)
        .maybeSingle();
      
      setIsReferral(!!referralData && !referralData.first_payment_at);
    }
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
          amount: basePrice,
          description: 'Оплата сценария',
          use_bonus: useBonus
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

      if (data?.paid_with_bonus) {
        toast.success(`Сценарий оплачен бонусами! Использовано: ${data.bonus_used}₽`);
        onClose();
        navigate('/dashboard');
        return;
      }

      if (data?.payment_url) {
        if (data.discount_applied) {
          toast.success('Применена скидка 15% для приглашенного пользователя!');
        }
        if (data.bonus_used > 0) {
          toast.success(`Использовано бонусов: ${data.bonus_used}₽`);
        }
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

  const calculateFinalPrice = () => {
    let price = basePrice;
    
    // Применяем скидку для приглашенных
    if (isReferral) {
      price = Math.round(price * 0.85); // 15% скидка
    }
    
    // Вычитаем бонусы если выбрано
    if (useBonus && bonusBalance > 0) {
      price = Math.max(0, price - bonusBalance);
    }
    
    return price;
  };

  const displayText = isFree && fullText ? fullText : preview;
  const wordCount = getWordCount(displayText);
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
          <p className="whitespace-pre-wrap text-base md:text-lg leading-relaxed font-sans" style={{ lineHeight: '1.8' }}>
            {displayText}
            {!isFree && <span className="text-muted-foreground">...</span>}
          </p>
        </div>

        {isFree && (
          <div className="mb-4 p-4 bg-primary/10 rounded-none border-2 border-primary/20">
            <p className="text-sm font-medium text-primary">
              🎉 Это ваш бесплатный тестовый сценарий! Следующие сценарии будут платными.
            </p>
          </div>
        )}

        {!isAuthenticated && !isFree && (
          <div className="mb-4 p-4 bg-muted/30 rounded-none border-2 border-border">
            <p className="text-sm text-muted-foreground">
              Войдите, чтобы сохранить сценарий в личном кабинете
            </p>
          </div>
        )}

        {isAuthenticated && bonusBalance > 0 && (
          <div className="mb-4 p-4 bg-primary/10 rounded-none border-2 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Доступно бонусов: {bonusBalance}₽</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBonus}
                  onChange={(e) => setUseBonus(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Использовать</span>
              </label>
            </div>
            {useBonus && (
              <p className="text-xs text-muted-foreground">
                Будет использовано: {Math.min(bonusBalance, calculateFinalPrice())}₽
              </p>
            )}
          </div>
        )}

        {isAuthenticated && isReferral && (
          <div className="mb-4 p-4 bg-green-500/10 rounded-none border-2 border-green-500/20">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              🎉 Скидка 15% на первую покупку!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Цена со скидкой: {Math.round(basePrice * 0.85)}₽ (вместо {basePrice}₽)
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {isFree ? (
            <Button onClick={onClose} size="lg" className="w-full sm:w-auto">
              Создать новый сценарий
            </Button>
          ) : (
            <>
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
                    <>
                      {calculateFinalPrice() === 0 ? 'Оплатить бонусами' : `Оплатить ${calculateFinalPrice()}₽`}
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={onClose} size="lg" className="w-full sm:w-auto">
                Создать новый сценарий
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioPreview;
