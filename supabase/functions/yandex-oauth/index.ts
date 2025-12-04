import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const redirectTo = url.searchParams.get('redirect') || '/dashboard';
    const origin = url.searchParams.get('origin') || 'https://talking-head.ru';

    const YANDEX_CLIENT_ID = Deno.env.get('YANDEX_CLIENT_ID');
    const YANDEX_CLIENT_SECRET = Deno.env.get('YANDEX_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!YANDEX_CLIENT_ID || !YANDEX_CLIENT_SECRET) {
      throw new Error('Yandex OAuth credentials not configured');
    }

    // If no code, redirect to Yandex OAuth
    if (!code) {
      const yandexAuthUrl = new URL('https://oauth.yandex.ru/authorize');
      yandexAuthUrl.searchParams.set('response_type', 'code');
      yandexAuthUrl.searchParams.set('client_id', YANDEX_CLIENT_ID);
      yandexAuthUrl.searchParams.set('redirect_uri', `${SUPABASE_URL}/functions/v1/yandex-oauth`);
      yandexAuthUrl.searchParams.set('state', JSON.stringify({ redirect: redirectTo, origin }));

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': yandexAuthUrl.toString(),
        },
      });
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: YANDEX_CLIENT_ID,
        client_secret: YANDEX_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Yandex
    const userInfoResponse = await fetch('https://login.yandex.ru/info?format=json', {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Yandex');
    }

    const yandexUser = await userInfoResponse.json();
    console.log('Yandex user:', yandexUser);

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if user exists by email
    const email = yandexUser.default_email || `${yandexUser.id}@yandex.ru`;
    
    // Try to find existing user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: yandexUser.real_name || yandexUser.display_name || yandexUser.login,
          avatar_url: yandexUser.default_avatar_id 
            ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200`
            : null,
          provider: 'yandex',
          yandex_id: yandexUser.id,
        },
      });

      if (createError) {
        console.error('Create user error:', createError);
        throw new Error('Failed to create user');
      }

      userId = newUser.user.id;

      // Create profile
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: yandexUser.real_name || yandexUser.display_name || yandexUser.login,
        avatar_url: yandexUser.default_avatar_id 
          ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200`
          : null,
      });
    }

    // Generate magic link for the user to sign in
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError) {
      console.error('Generate link error:', linkError);
      throw new Error('Failed to generate auth link');
    }

    // Extract token from the link
    const magicLinkUrl = new URL(linkData.properties.action_link);
    const token = magicLinkUrl.hash.split('access_token=')[1]?.split('&')[0];
    
    // Parse state to get redirect
    let finalRedirect = '/dashboard';
    let finalOrigin = 'https://talking-head.ru';
    
    const state = url.searchParams.get('state');
    if (state) {
      try {
        const parsed = JSON.parse(state);
        finalRedirect = parsed.redirect || '/dashboard';
        finalOrigin = parsed.origin || 'https://talking-head.ru';
      } catch (e) {
        console.error('Failed to parse state:', e);
      }
    }

    // Redirect back to app with session info
    const redirectUrl = `${finalOrigin}/auth/yandex-callback?token=${encodeURIComponent(linkData.properties.hashed_token)}&type=magiclink&redirect=${encodeURIComponent(finalRedirect)}`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Yandex OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
