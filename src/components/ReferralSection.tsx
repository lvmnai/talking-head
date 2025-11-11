import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, Users, MousePointerClick, ShoppingCart, Wallet } from "lucide-react";
import { toast } from "sonner";

interface ReferralStats {
  code: string;
  clicks: number;
  registrations: number;
  conversions: number;
  bonusBalance: number;
  totalEarned: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export const ReferralSection = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Load referral code
      const { data: codeData } = await supabase
        .from('referral_codes')
        .select('code, clicks')
        .eq('user_id', session.user.id)
        .single();

      // Load referrals count
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', session.user.id);

      // Load bonus balance
      const { data: balance } = await supabase
        .from('bonus_balance')
        .select('balance, total_earned')
        .eq('user_id', session.user.id)
        .single();

      // Load transactions
      const { data: txData } = await supabase
        .from('bonus_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const registrations = referrals?.length || 0;
      const conversions = referrals?.filter(r => r.status === 'converted').length || 0;

      setStats({
        code: codeData?.code || '',
        clicks: codeData?.clicks || 0,
        registrations,
        conversions,
        bonusBalance: parseFloat(String(balance?.balance || 0)),
        totalEarned: parseFloat(String(balance?.total_earned || 0)),
      });

      setTransactions(txData || []);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!stats) return;
    const link = `${window.location.origin}?ref=${stats.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Реферальная ссылка скопирована!");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!stats) return null;

  const referralLink = `${window.location.origin}?ref=${stats.code}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-2">Реферальная программа</h2>
        <p className="text-muted-foreground">
          Приглашайте друзей и получайте 25% от всех их платежей на бонусный счет
        </p>
      </div>

      {/* Bonus Balance Card */}
      <Card className="p-6 sketch-border-light bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="font-medium">Бонусный баланс</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {stats.bonusBalance.toFixed(2)} ₽
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Всего заработано: {stats.totalEarned.toFixed(2)} ₽
        </div>
      </Card>

      {/* Referral Link */}
      <Card className="p-6 sketch-border-light">
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Ваша реферальная ссылка</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
            />
            <Button onClick={copyReferralLink} size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Копировать
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Поделитесь этой ссылкой с друзьями. Они получат скидку 15% на первую покупку, 
          а вы — 25% от всех их покупок на бонусный счет.
        </p>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sketch-border-light">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <MousePointerClick className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.clicks}</div>
              <div className="text-sm text-muted-foreground">Переходов</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sketch-border-light">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.registrations}</div>
              <div className="text-sm text-muted-foreground">Регистраций</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sketch-border-light">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.conversions}</div>
              <div className="text-sm text-muted-foreground">Покупок</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card className="p-6 sketch-border-light">
          <h3 className="font-medium mb-4">История начислений</h3>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    tx.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'earned' ? '+' : '-'}{Number(tx.amount).toFixed(2)} ₽
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};