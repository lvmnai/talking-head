import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Получаем scenario_id из URL параметров
      const scenarioId = searchParams.get("scenario_id");
      
      if (!scenarioId) {
        setStatus("error");
        setMessage("Не указан ID сценария");
        return;
      }

      try {
        // Проверяем статус оплаты сценария
        const { data: scenario, error } = await supabase
          .from("scenarios")
          .select("is_paid")
          .eq("id", scenarioId)
          .single();

        if (error) throw error;

        if (scenario?.is_paid) {
          setStatus("success");
          setMessage("Оплата успешно завершена! Полный текст сценария доступен в личном кабинете.");
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            });
          }, 250);
          
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            });
          }, 400);
        } else {
          setStatus("error");
          setMessage("Оплата не завершена. Попробуйте еще раз или обратитесь в поддержку.");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus("error");
        setMessage("Произошла ошибка при проверке статуса оплаты");
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  // Auto-redirect countdown for success
  useEffect(() => {
    if (status === "success" && autoRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (status === "success" && autoRedirect && countdown === 0) {
      navigate("/dashboard");
    }
  }, [status, countdown, navigate, autoRedirect]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="space-y-4 w-full">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                <Progress value={33} className="w-full" />
              </div>
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-scale-in" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-destructive animate-scale-in" />
            )}
          </div>
          <CardTitle className="text-xl md:text-2xl">
            {status === "loading" && "Проверяем статус оплаты..."}
            {status === "success" && "Оплата успешна!"}
            {status === "error" && "Ошибка оплаты"}
          </CardTitle>
          <CardDescription className="text-sm md:text-base mt-2">
            {message}
          </CardDescription>
          {status === "success" && autoRedirect && (
            <CardDescription className="text-sm mt-4">
              Автоматический переход через {countdown} сек...
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === "success" && (
            <>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Перейти в личный кабинет
              </Button>
              <Button 
                onClick={() => setAutoRedirect(false)} 
                variant="ghost" 
                size="sm"
                className="w-full"
              >
                Отменить автопереход
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Перейти в личный кабинет
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="w-full"
              >
                На главную
              </Button>
              <Button 
                onClick={() => window.open("mailto:support@talking-head.ru")} 
                variant="ghost" 
                size="sm"
                className="w-full"
              >
                Связаться с поддержкой
              </Button>
            </>
          )}
          {status === "loading" && (
            <p className="text-sm text-muted-foreground text-center">
              Пожалуйста, подождите...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReturn;
