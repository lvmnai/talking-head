import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(jwt);
      userId = user?.id || null;
    }

    // Try to read JSON body; fall back to empty object if none
    const body = await req.json().catch(() => ({} as any));

    // Accept both the old and new schema
    const sphere = (body.sphere ?? '').toString().trim();
    const product = (body.product ?? '').toString().trim();
    const problems = (body.problems ?? '').toString().trim();

    const ideaRaw = body.idea as string | undefined;
    const idea = ideaRaw?.trim() ||
      (sphere && product && problems
        ? `Сфера: ${sphere}. Продукт/услуга: ${product}. Проблемы ЦА: ${problems}.`
        : '');

    const audience = (body.audience ?? '').toString().trim();
    const purpose = (body.purpose ?? body.goal ?? '').toString().trim();
    const tone = (body.tone ?? '').toString().trim();
    const format = (body.format ?? '').toString().trim();

    // Optional: platform/channel if provided in any schema
    const contentType = (body.contentType ?? body.channel ?? '').toString().trim();

    // Validate based on the new landing form (sphere/product/problems can synthesize idea)
    const missing: string[] = [];
    if (!idea) missing.push('idea (или sphere+product+problems)');
    if (!audience) missing.push('audience');
    if (!purpose) missing.push('purpose/goal');
    if (!tone) missing.push('tone');
    if (!format) missing.push('format');

    if (missing.length) {
      console.error('Missing required fields:', { idea, contentType, audience, purpose, tone, format });
      return new Response(
        JSON.stringify({
          error: 'Отсутствуют обязательные поля',
          details: `Заполните поля: ${missing.join(', ')}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build webhook URL with GET query params
    const base = 'https://lvmnai.ru/webhook/dc2ac900-e689-4421-8f0f-cb4358f4f0a0';
    const url = new URL(base);

    url.searchParams.set('idea', idea);
    url.searchParams.set('audience', audience);
    url.searchParams.set('purpose', purpose);
    url.searchParams.set('tone', tone);
    url.searchParams.set('format', format);
    url.searchParams.set('mood', 'creative');

    // Include optional or extra context if present
    if (contentType) url.searchParams.set('channel', contentType);
    if (sphere) url.searchParams.set('sphere', sphere);
    if (product) url.searchParams.set('product', product);
    if (problems) url.searchParams.set('problems', problems);

    console.log('Отправка GET на webhook:', url.toString());
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    console.log('Webhook response status (GET):', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка webhook (GET):', errorText);
      return new Response(
        JSON.stringify({ error: `Ошибка webhook: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseText = await response.text();
    console.log('Webhook response:', responseText);

    let fullText: string;
    try {
      const parsed = JSON.parse(responseText);
      fullText = parsed.scenario || responseText;
    } catch {
      fullText = responseText;
    }

    // Extract first paragraph as preview
    const lines = fullText.split('\n').filter(line => line.trim());
    const preview = lines[0] || fullText.substring(0, 200) + '...';

    // Save scenario to database if user is authenticated
    let scenarioId: string | null = null;
    
    if (userId) {
      const { data: scenarioData, error: insertError } = await supabase
        .from('scenarios')
        .insert({
          user_id: userId,
          full_text: fullText,
          preview_text: preview,
          parameters: {
            sphere,
            product,
            audience,
            problems,
            goal: purpose,
            tone,
            format,
          },
          is_paid: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error saving scenario:', insertError);
      } else {
        scenarioId = scenarioData.id;
      }
    }

    return new Response(JSON.stringify({
      preview,
      scenarioId,
      fullText, // Временно для демо
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-scenario function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Неизвестная ошибка' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
