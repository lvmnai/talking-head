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
  const [yandexLoading, setYandexLoading] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const refCode = searchParams.get("ref");

  useEffect(() => {
    // Save referral code to localStorage
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
      // Track click
      supabase.functions.invoke('track-referral', {
        body: { code: refCode }
      }).catch(err => console.error('Error tracking referral:', err));
    }

    // Проверяем, авторизован ли пользователь
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If user just signed in with referral code, link them
        const savedRefCode = localStorage.getItem('referral_code');
        if (savedRefCode) {
          supabase.functions.invoke('track-referral', {
            body: { code: savedRefCode, userId: session.user.id }
          }).then(() => {
            localStorage.removeItem('referral_code');
          }).catch(err => console.error('Error linking referral:', err));
        }
        navigate(redirectTo);
      }
    });

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Link referral if exists
        const savedRefCode = localStorage.getItem('referral_code');
        if (savedRefCode) {
          await supabase.functions.invoke('track-referral', {
            body: { code: savedRefCode, userId: session.user.id }
          }).catch(err => console.error('Error linking referral:', err));
          localStorage.removeItem('referral_code');
        }
        navigate(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo, refCode]);

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

  const handleYandexSignIn = () => {
    setYandexLoading(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const yandexOAuthUrl = `${supabaseUrl}/functions/v1/yandex-oauth?redirect=${encodeURIComponent(redirectTo)}&origin=${encodeURIComponent(window.location.origin)}`;
    window.location.href = yandexOAuthUrl;
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

          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading || yandexLoading}
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

            <Button
              onClick={handleYandexSignIn}
              disabled={isLoading || yandexLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {yandexLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Вход...
                </>
              ) : (
                "Войти через Yandex"
              )}
            </Button>
          </div>

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
