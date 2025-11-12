import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Извлекаем токен из заголовка
    const token = authHeader.replace(/^Bearer\s+/i, '');
    console.log('Token prefix:', token.substring(0, 20) + '...');

    // Используем anon key для проверки пользователя
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Используем getUser с явным токеном
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    console.log('User check:', { userId: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);
    }

    // Используем service role для операций с БД
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { scenario_id, amount, description, use_bonus } = await req.json();

    if (!scenario_id || !amount) {
      throw new Error('Missing required fields: scenario_id, amount');
    }

    // Check if scenario is free - cannot create payment for free scenarios
    const { data: scenarioData } = await supabaseAdmin
      .from('scenarios')
      .select('is_free')
      .eq('id', scenario_id)
      .single();

    if (scenarioData?.is_free) {
      console.log(`Attempt to create payment for free scenario ${scenario_id}`);
      throw new Error('Cannot create payment for free scenario');
    }

    let finalAmount = amount;
    let bonusUsed = 0;

    // Проверяем является ли пользователь приглашенным и первая ли это покупка
    const { data: referralData } = await supabaseAdmin
      .from('referrals')
      .select('status, first_payment_at')
      .eq('referred_id', user.id)
      .maybeSingle();

    // Применяем 15% скидку для первой покупки приглашенных
    if (referralData && !referralData.first_payment_at) {
      finalAmount = Math.round(amount * 0.85); // 15% скидка
      console.log('Applied 15% referral discount:', { original: amount, discounted: finalAmount });
    }

    // Если пользователь хочет использовать бонусы
    if (use_bonus) {
      const { data: bonusData } = await supabaseAdmin
        .from('bonus_balance')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (bonusData && bonusData.balance > 0) {
        // Используем бонусы для оплаты (максимум до полной суммы)
        bonusUsed = Math.min(bonusData.balance, finalAmount);
        finalAmount -= bonusUsed;
        console.log('Using bonus:', { available: bonusData.balance, used: bonusUsed, remaining: finalAmount });
      }
    }

    // Если вся сумма оплачена бонусами
    if (finalAmount <= 0) {
      // Получаем текущий баланс
      const { data: currentBonus } = await supabaseAdmin
        .from('bonus_balance')
        .select('balance, total_spent')
        .eq('user_id', user.id)
        .single();

      if (!currentBonus) {
        throw new Error('Bonus balance not found');
      }

      // Списываем бонусы
      await supabaseAdmin
        .from('bonus_balance')
        .update({
          balance: currentBonus.balance - bonusUsed,
          total_spent: currentBonus.total_spent + bonusUsed
        })
        .eq('user_id', user.id);

      // Создаем транзакцию
      await supabaseAdmin
        .from('bonus_transactions')
        .insert({
          user_id: user.id,
          amount: -bonusUsed,
          type: 'spend',
          source: 'payment',
          description: 'Оплата сценария бонусами'
        });

      // Обновляем сценарий как оплаченный
      await supabaseAdmin
        .from('scenarios')
        .update({ is_paid: true })
        .eq('id', scenario_id);

      // Обновляем статус реферала если это первая покупка
      if (referralData && !referralData.first_payment_at) {
        await supabaseAdmin
          .from('referrals')
          .update({
            status: 'paid',
            first_payment_at: new Date().toISOString()
          })
          .eq('referred_id', user.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          paid_with_bonus: true,
          bonus_used: bonusUsed
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create payment in database first (using service role)
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        scenario_id,
        amount: finalAmount + bonusUsed, // Сохраняем полную сумму до применения бонусов
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
    const returnUrl = 'https://talking-head.ru/dashboard';

    const yookassaPayload = {
      amount: {
        value: finalAmount.toFixed(2),
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
      receipt: {
        customer: {
          email: user.email ?? undefined,
        },
        items: [
          {
            description: description || 'Оплата сценария',
            quantity: '1.00',
            amount: {
              value: finalAmount.toFixed(2),
              currency: 'RUB',
            },
            vat_code: 1,
            payment_mode: 'full_payment',
            payment_subject: 'service',
          },
        ],
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
      console.error('YooKassa error:', { status: yookassaResponse.status, body: errorText });
      
      let errorMessage = `YooKassa API error: ${yookassaResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.description || errorData.error_description || errorMessage;
      } catch (e) {
        // Если не JSON, используем текст как есть
        if (errorText) errorMessage = errorText;
      }
      
      throw new Error(errorMessage);
    }

    const yookassaData = await yookassaResponse.json();

    // Update payment with YooKassa payment ID and URL
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        yookassa_payment_id: yookassaData.id,
        payment_url: yookassaData.confirmation.confirmation_url,
      })
      .eq('id', paymentData.id);

    if (updateError) {
      console.error('Payment update error:', updateError);
    }

    // Если использовались бонусы, списываем их
    if (bonusUsed > 0) {
      // Получаем текущий баланс
      const { data: currentBonus } = await supabaseAdmin
        .from('bonus_balance')
        .select('balance, total_spent')
        .eq('user_id', user.id)
        .single();

      if (currentBonus) {
        await supabaseAdmin
          .from('bonus_balance')
          .update({
            balance: currentBonus.balance - bonusUsed,
            total_spent: currentBonus.total_spent + bonusUsed
          })
          .eq('user_id', user.id);

        await supabaseAdmin
          .from('bonus_transactions')
          .insert({
            user_id: user.id,
            amount: -bonusUsed,
            type: 'spend',
            source: 'payment',
            payment_id: paymentData.id,
            description: `Частичная оплата бонусами: ${bonusUsed}₽`
          });
      }
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentData.id,
        payment_url: yookassaData.confirmation.confirmation_url,
        yookassa_payment_id: yookassaData.id,
        bonus_used: bonusUsed,
        discount_applied: referralData && !referralData.first_payment_at,
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