import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectTo);
      }
    });

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?redirect=${redirectTo}`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(error.message || "Ошибка входа через Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="sketch-border-light bg-background p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium tracking-tight mb-2">
              Добро пожаловать
            </h1>
            <p className="text-muted-foreground">
              Войдите, чтобы сохранить сценарии в личном кабинете
            </p>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти через Google"
            )}
          </Button>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
