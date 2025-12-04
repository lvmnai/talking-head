import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const YandexCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const redirect = searchParams.get('redirect') || '/dashboard';

      if (!token) {
        setError('Токен не найден');
        return;
      }

      try {
        // Verify the token with Supabase
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'magiclink',
        });

        if (verifyError) {
          console.error('Verify error:', verifyError);
          setError('Ошибка авторизации: ' + verifyError.message);
          return;
        }

        if (data.session) {
          // Link referral if exists
          const savedRefCode = localStorage.getItem('referral_code');
          if (savedRefCode) {
            await supabase.functions.invoke('track-referral', {
              body: { code: savedRefCode, userId: data.session.user.id }
            }).catch(err => console.error('Error linking referral:', err));
            localStorage.removeItem('referral_code');
          }

          navigate(redirect);
        } else {
          setError('Не удалось создать сессию');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('Произошла ошибка при авторизации');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Выполняется вход...</p>
      </div>
    </div>
  );
};

export default YandexCallback;
