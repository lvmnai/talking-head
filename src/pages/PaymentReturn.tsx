import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Проверяем статус оплаты..."}
            {status === "success" && "Оплата успешна!"}
            {status === "error" && "Ошибка оплаты"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === "success" && (
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Перейти в личный кабинет
            </Button>
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
