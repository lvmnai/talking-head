import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// YooKassa official IP addresses for webhook notifications
// Source: https://yookassa.ru/developers/using-api/webhooks#notification-authentication
const YOOKASSA_IPS = [
  '185.71.76.0/27',
  '185.71.77.0/27', 
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
  '2a02:5180::/32'
];

// Helper function to check if IP is in range
function isIpInRange(ip: string, range: string): boolean {
  if (range.includes('/')) {
    // CIDR notation
    const [rangeIp, bits] = range.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    
    const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    const rangeNum = rangeIp.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    
    return (ipNum & mask) === (rangeNum & mask);
  } else {
    // Single IP
    return ip === range;
  }
}

// Helper function to verify IP address
function verifyYooKassaIp(request: Request): boolean {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';
  
  console.log('Webhook request from IP:', clientIp);
  
  // For IPv6 addresses, skip detailed check (YooKassa uses 2a02:5180::/32)
  if (clientIp.includes(':')) {
    return clientIp.startsWith('2a02:5180');
  }
  
  // Check if IP is in allowed ranges
  const isAllowed = YOOKASSA_IPS.some(range => {
    try {
      return isIpInRange(clientIp, range);
    } catch (e) {
      console.error('Error checking IP range:', e);
      return false;
    }
  });
  
  if (!isAllowed) {
    console.error('Webhook rejected: IP not in YooKassa whitelist:', clientIp);
  }
  
  return isAllowed;
}

// Helper function to verify payment with YooKassa API
async function verifyPaymentWithApi(paymentId: string): Promise<any> {
  const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
  const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');
  
  const authString = btoa(`${shopId}:${secretKey}`);
  
  try {
    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to verify payment with YooKassa API:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying payment with API:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify that webhook is from YooKassa IP
    if (!verifyYooKassaIp(req)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid source IP' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    
    console.log('YooKassa webhook received:', JSON.stringify(webhookData, null, 2));

    const event = webhookData.event;
    const paymentObject = webhookData.object;

    if (event === 'payment.succeeded') {
      const yookassaPaymentId = paymentObject.id;
      const metadata = paymentObject.metadata;

      // SECURITY: Verify payment status with YooKassa API before processing
      console.log('Verifying payment with YooKassa API:', yookassaPaymentId);
      const verifiedPayment = await verifyPaymentWithApi(yookassaPaymentId);
      
      if (!verifiedPayment) {
        console.error('Payment verification failed - could not fetch from API');
        throw new Error('Payment verification failed');
      }
      
      if (verifiedPayment.status !== 'succeeded') {
        console.error('Payment verification failed - status mismatch:', {
          webhook_status: 'succeeded',
          api_status: verifiedPayment.status
        });
        throw new Error('Payment status mismatch - potential fraud attempt');
      }
      
      console.log('Payment verified successfully:', yookassaPaymentId);

      // Find payment in database
      const { data: payment, error: findError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('yookassa_payment_id', yookassaPaymentId)
        .single();

      if (findError || !payment) {
        console.error('Payment not found:', yookassaPaymentId, findError);
        throw new Error('Payment not found');
      }

      // Update payment status
      const { error: updatePaymentError } = await supabaseClient
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('id', payment.id);

      if (updatePaymentError) {
        console.error('Error updating payment:', updatePaymentError);
        throw updatePaymentError;
      }

      // Mark scenario as paid and bind to user
      const { error: updateScenarioError } = await supabaseClient
        .from('scenarios')
        .update({
          is_paid: true,
          payment_id: yookassaPaymentId,
          user_id: payment.user_id, // ensure ownership after payment
        })
        .eq('id', payment.scenario_id);

      if (updateScenarioError) {
        console.error('Error updating scenario:', updateScenarioError);
        throw updateScenarioError;
      }

      console.log(`Payment ${payment.id} succeeded, scenario ${payment.scenario_id} marked as paid`);

      // Get scenario to check if it's free
      const { data: scenario } = await supabaseClient
        .from('scenarios')
        .select('is_free')
        .eq('id', payment.scenario_id)
        .single();

      // Skip bonus for free scenarios
      if (scenario?.is_free) {
        console.log(`Free scenario payment detected for scenario ${payment.scenario_id}, skipping referral bonus`);
        return new Response(
          JSON.stringify({ success: true, message: 'Free scenario, no bonus awarded' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if user was referred and calculate bonus for referrer
      const { data: referral } = await supabaseClient
        .from('referrals')
        .select('referrer_id, status, first_payment_at')
        .eq('referred_id', payment.user_id)
        .maybeSingle();

      if (referral) {
        const bonusAmount = (parseFloat(payment.amount) * 0.25).toFixed(2); // 25% комиссия

        // Update referral status on first payment
        if (!referral.first_payment_at) {
          await supabaseClient
            .from('referrals')
            .update({
              status: 'paid',
              first_payment_at: new Date().toISOString()
            })
            .eq('referred_id', payment.user_id);
          
          console.log(`First payment detected for referred user ${payment.user_id}, updated referral status to 'paid'`);
        }

        // Add bonus to referrer
        const { data: balance } = await supabaseClient
          .from('bonus_balance')
          .select('balance, total_earned')
          .eq('user_id', referral.referrer_id)
          .single();

        if (balance) {
          const newBalance = parseFloat(balance.balance) + parseFloat(bonusAmount);
          const newTotalEarned = parseFloat(balance.total_earned) + parseFloat(bonusAmount);

          await supabaseClient
            .from('bonus_balance')
            .update({
              balance: newBalance,
              total_earned: newTotalEarned,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', referral.referrer_id);

          // Record transaction
          await supabaseClient
            .from('bonus_transactions')
            .insert({
              user_id: referral.referrer_id,
              amount: bonusAmount,
              type: 'earned',
              source: 'referral_commission',
              payment_id: payment.id,
              description: `Комиссия 25% с оплаты приглашенного пользователя`
            });

          console.log(`Bonus ${bonusAmount} added to referrer ${referral.referrer_id}`);
        }
      }
    } else if (event === 'payment.canceled') {
      const yookassaPaymentId = paymentObject.id;

      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({ status: 'canceled' })
        .eq('yookassa_payment_id', yookassaPaymentId);

      if (updateError) {
        console.error('Error updating canceled payment:', updateError);
      }

      console.log(`Payment ${yookassaPaymentId} canceled`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in yookassa-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});