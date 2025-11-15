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
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium tracking-tight mb-4">Реферальная программа</h2>
        <p className="text-lg text-muted-foreground">
          Скоро добавим
        </p>
      </div>

    </div>
  );
};