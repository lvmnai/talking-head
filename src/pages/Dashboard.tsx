import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Trash2, Copy, Download, LogOut } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

  useEffect(() => {
    checkAuth();
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

  const handleDownload = (text: string, id: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenario-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Файл загружен");
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
        <div className="sketch-border-light p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-medium tracking-tight">
                  {profile?.full_name || "Пользователь"}
                </h1>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>

        {/* Scenarios List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium tracking-tight">Мои сценарии</h2>
            <Button onClick={() => navigate("/")}>Создать новый</Button>
          </div>

          {scenarios.length === 0 ? (
            <div className="sketch-border-light p-12 text-center">
              <p className="text-xl text-muted-foreground mb-4">
                У вас пока нет сценариев
              </p>
              <Button onClick={() => navigate("/")}>Создать первый сценарий</Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="sketch-border-light p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
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

                  <div className="bg-muted/50 p-4 rounded-none mb-4 max-h-60 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">
                      {scenario.preview_text}
                      {!scenario.is_paid && "..."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {scenario.is_paid ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleCopy(scenario.full_text)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Копировать
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(scenario.full_text, scenario.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Скачать
                        </Button>
                      </>
                    ) : (
                      <Button disabled className="cursor-not-allowed">
                        Оплатить 3000₽ (скоро доступно)
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
