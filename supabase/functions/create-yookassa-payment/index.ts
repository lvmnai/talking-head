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
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    console.log('User check:', { userId: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);
    }

    const { scenario_id, amount, description } = await req.json();

    if (!scenario_id || !amount) {
      throw new Error('Missing required fields: scenario_id, amount');
    }

    // Create payment in database first
    const { data: paymentData, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        scenario_id,
        amount,
        currency: 'RUB',
        description: description || 'Оплата сценария',
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment insert error:', paymentError);
      throw paymentError;
    }

    // Create YooKassa payment
    const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
    const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');
    
    if (!shopId || !secretKey) {
      throw new Error('YooKassa credentials not configured');
    }

    const idempotenceKey = crypto.randomUUID();
    const returnUrl = `${req.headers.get('origin')}/dashboard?payment_id=${paymentData.id}`;

    const yookassaPayload = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      description: description || 'Оплата сценария',
      metadata: {
        payment_id: paymentData.id,
        user_id: user.id,
        scenario_id,
      },
    };

    const yookassaAuthHeader = 'Basic ' + btoa(`${shopId}:${secretKey}`);

    const yookassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        'Authorization': yookassaAuthHeader,
      },
      body: JSON.stringify(yookassaPayload),
    });

    if (!yookassaResponse.ok) {
      const errorText = await yookassaResponse.text();
      console.error('YooKassa error:', errorText);
      throw new Error(`YooKassa API error: ${yookassaResponse.status}`);
    }

    const yookassaData = await yookassaResponse.json();

    // Update payment with YooKassa payment ID and URL
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        yookassa_payment_id: yookassaData.id,
        payment_url: yookassaData.confirmation.confirmation_url,
      })
      .eq('id', paymentData.id);

    if (updateError) {
      console.error('Payment update error:', updateError);
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentData.id,
        payment_url: yookassaData.confirmation.confirmation_url,
        yookassa_payment_id: yookassaData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-yookassa-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});