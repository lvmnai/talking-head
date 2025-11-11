import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

      // Mark scenario as paid
      const { error: updateScenarioError } = await supabaseClient
        .from('scenarios')
        .update({
          is_paid: true,
          payment_id: yookassaPaymentId,
        })
        .eq('id', payment.scenario_id);

      if (updateScenarioError) {
        console.error('Error updating scenario:', updateScenarioError);
        throw updateScenarioError;
      }

      console.log(`Payment ${payment.id} succeeded, scenario ${payment.scenario_id} marked as paid`);
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