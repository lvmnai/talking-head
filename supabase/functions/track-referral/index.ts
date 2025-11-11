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

    const { code, userId } = await req.json();
    
    console.log('Tracking referral:', { code, userId });

    if (!code) {
      throw new Error('Referral code is required');
    }

    // Increment click count
    await supabaseClient.rpc('increment_referral_clicks', { ref_code: code });

    // If user is registering, create referral link
    if (userId) {
      const { data: referralCode } = await supabaseClient
        .from('referral_codes')
        .select('user_id')
        .eq('code', code)
        .single();

      if (referralCode && referralCode.user_id !== userId) {
        // Create referral relationship
        const { error: insertError } = await supabaseClient
          .from('referrals')
          .insert({
            referrer_id: referralCode.user_id,
            referred_id: userId,
            status: 'registered'
          });

        if (insertError) {
          console.error('Error creating referral:', insertError);
        } else {
          console.log('Referral created successfully');
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in track-referral:', error);
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