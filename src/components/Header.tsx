import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import logoTalkingHead from "@/assets/logo-talking-head.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  const navLinks = [
    { name: "Главная", path: "/" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-border sketch-border-light">
      <div className="container mx-auto px-3 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img src={logoTalkingHead} alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-base sm:text-2xl font-medium text-foreground tracking-tight">
              Говорящая голова
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive(link.path) ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">Личный кабинет</span>
                  <span className="sm:hidden">Кабинет</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Выйти
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-4"
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
