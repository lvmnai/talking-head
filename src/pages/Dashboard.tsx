import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Copy, Download, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportScenario, ExportFormat } from "@/lib/exportUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReferralSection } from "@/components/ReferralSection";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Scenario {
  id: string;
  preview_text: string;
  full_text: string;
  parameters: any;
  is_paid: boolean;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingScenarios, setPayingScenarios] = useState<Set<string>>(new Set());
  const [bonusBalance, setBonusBalance] = useState(0);
  const [useBonusMap, setUseBonusMap] = useState<Map<string, boolean>>(new Map());
  const [isReferral, setIsReferral] = useState(false);
  const basePrice = 10;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Subscribe to realtime changes in scenarios table
    const channel = supabase
      .channel('scenarios-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scenarios'
        },
        (payload) => {
          console.log('Scenario updated:', payload);
          // Update the scenario in the local state
          setScenarios(prev => 
            prev.map(s => 
              s.id === payload.new.id 
                ? { ...s, ...payload.new } 
                : s
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth?redirect=/dashboard");
      return;
    }

    // Загружаем профиль
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Загружаем сценарии
    const { data: scenariosData } = await supabase
      .from("scenarios")
      .select("*")
      .order("created_at", { ascending: false });

    if (scenariosData) {
      setScenarios(scenariosData);
    }

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

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("scenarios")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Ошибка при удалении сценария");
      return;
    }

    setScenarios(scenarios.filter((s) => s.id !== id));
    toast.success("Сценарий удалён");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  };

  const handleDownload = async (text: string, id: string, format: ExportFormat) => {
    try {
      await exportScenario(text, id, format);
      const formatNames = {
        txt: "TXT",
        pdf: "PDF",
        docx: "DOCX",
        md: "Markdown"
      };
      toast.success(`Файл ${formatNames[format]} загружен`);
    } catch (error) {
      toast.error("Ошибка при экспорте файла");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handlePayment = async (scenarioId: string) => {
    setPayingScenarios(prev => new Set(prev).add(scenarioId));
    
    try {
      // Получаем сессию для передачи access_token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Необходимо войти в систему');
        navigate('/auth?redirect=/dashboard');
        return;
      }

      const useBonus = useBonusMap.get(scenarioId) || false;

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
        // Обновляем список сценариев
        await checkAuth();
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
      setPayingScenarios(prev => {
        const newSet = new Set(prev);
        newSet.delete(scenarioId);
        return newSet;
      });
    }
  };

  const calculateFinalPrice = (scenarioId: string) => {
    let price = basePrice;
    
    // Применяем скидку для приглашенных
    if (isReferral) {
      price = Math.round(price * 0.85); // 15% скидка
    }
    
    // Вычитаем бонусы если выбрано
    if (useBonusMap.get(scenarioId) && bonusBalance > 0) {
      price = Math.max(0, price - bonusBalance);
    }
    
    return price;
  };

  const toggleBonusUsage = (scenarioId: string) => {
    setUseBonusMap(prev => {
      const newMap = new Map(prev);
      newMap.set(scenarioId, !newMap.get(scenarioId));
      return newMap;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-8 mt-20">
          <div className="space-y-8">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8 mt-20">
        {/* User Header */}
        <div className="sketch-border-light p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-medium tracking-tight mb-1">
                {profile?.full_name || "Пользователь"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">{profile?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} size="sm" className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scenarios">Мои сценарии</TabsTrigger>
            <TabsTrigger value="referral">Реферальная программа</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-medium tracking-tight">Мои сценарии</h2>
                <Button onClick={() => navigate("/")} size="sm" className="w-full sm:w-auto">Создать новый</Button>
              </div>

          {scenarios.length === 0 ? (
            <div className="sketch-border-light p-12 text-center">
              <p className="text-xl text-muted-foreground mb-4">
                У вас пока нет сценариев
              </p>
              <Button onClick={() => navigate("/")}>Создать первый сценарий</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="sketch-border-light p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex flex-wrap gap-2 flex-1">
                      {scenario.parameters?.sphere && (
                        <Badge variant="secondary">{scenario.parameters.sphere}</Badge>
                      )}
                      {scenario.parameters?.product && (
                        <Badge variant="secondary">{scenario.parameters.product}</Badge>
                      )}
                      {scenario.parameters?.goal && (
                        <Badge variant="outline">Цель: {scenario.parameters.goal}</Badge>
                      )}
                      {scenario.parameters?.tone && (
                        <Badge variant="outline">Тон: {scenario.parameters.tone}</Badge>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить сценарий?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Сценарий будет удалён навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(scenario.id)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {formatDate(scenario.created_at)}
                  </p>

                  <div className="bg-muted/50 p-3 md:p-4 rounded-none mb-4 max-h-60 md:max-h-96 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm md:text-base" style={{ lineHeight: '1.6' }}>
                      {scenario.preview_text}
                      {!scenario.is_paid && "..."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {scenario.is_paid ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleCopy(scenario.full_text)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Копировать
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              Скачать
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleDownload(scenario.full_text, scenario.id, "txt")}
                            >
                              Скачать как TXT
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(scenario.full_text, scenario.id, "pdf")}
                            >
                              Скачать как PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(scenario.full_text, scenario.id, "docx")}
                            >
                              Скачать как DOCX
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(scenario.full_text, scenario.id, "md")}
                            >
                              Скачать как Markdown
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                     ) : (
                      <>
                        {bonusBalance > 0 && (
                          <div className="mb-3 p-3 bg-primary/10 rounded-none border border-primary/20">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium">Доступно: {bonusBalance}₽</p>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={useBonusMap.get(scenario.id) || false}
                                  onChange={() => toggleBonusUsage(scenario.id)}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs">Использовать</span>
                              </label>
                            </div>
                          </div>
                        )}
                        {isReferral && (
                          <div className="mb-3 p-2 bg-green-500/10 rounded-none border border-green-500/20">
                            <p className="text-xs font-medium text-green-700 dark:text-green-300">
                              🎉 Скидка 15%: {Math.round(basePrice * 0.85)}₽
                            </p>
                          </div>
                        )}
                        <Button 
                          onClick={() => handlePayment(scenario.id)} 
                          disabled={payingScenarios.has(scenario.id)}
                          className="payment-pulse w-full"
                        >
                          {payingScenarios.has(scenario.id) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Создание платежа...
                            </>
                          ) : (
                            <>
                              {calculateFinalPrice(scenario.id) === 0 
                                ? 'Оплатить бонусами' 
                                : `Оплатить ${calculateFinalPrice(scenario.id)}₽`}
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="referral">
          <ReferralSection />
        </TabsContent>
      </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
