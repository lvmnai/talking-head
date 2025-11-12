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

    // Input validation - maximum lengths
    const MAX_TEXT_LENGTH = 2000;
    const VALID_TONES = ['friendly', 'witty', 'provocative'];
    const VALID_FORMATS = ['short', 'long'];
    const VALID_GOALS = ['sales', 'viral', 'both'];

    // Accept both the old and new schema
    const sphere = (body.sphere ?? '').toString().trim();
    const product = (body.product ?? '').toString().trim();
    const problems = (body.problems ?? '').toString().trim();

    // Validate lengths
    if (sphere.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Поле "Сфера" превышает лимит в ${MAX_TEXT_LENGTH} символов` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (product.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Поле "Продукт/услуга" превышает лимит в ${MAX_TEXT_LENGTH} символов` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (problems.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Поле "Проблемы ЦА" превышает лимит в ${MAX_TEXT_LENGTH} символов` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ideaRaw = body.idea as string | undefined;
    const idea = ideaRaw?.trim() ||
      (sphere && product && problems
        ? `Сфера: ${sphere}. Продукт/услуга: ${product}. Проблемы ЦА: ${problems}.`
        : '');

    const audience = (body.audience ?? '').toString().trim();
    if (audience.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Поле "Целевая аудитория" превышает лимит в ${MAX_TEXT_LENGTH} символов` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const purpose = (body.purpose ?? body.goal ?? '').toString().trim();
    const tone = (body.tone ?? '').toString().trim();
    const format = (body.format ?? '').toString().trim();
    const isFree = body.is_free === true;

    // Validate enum values
    if (tone && !VALID_TONES.includes(tone)) {
      return new Response(
        JSON.stringify({ error: `Некорректное значение поля "Тональность". Допустимые значения: ${VALID_TONES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (format && !VALID_FORMATS.includes(format)) {
      return new Response(
        JSON.stringify({ error: `Некорректное значение поля "Формат". Допустимые значения: ${VALID_FORMATS.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (purpose && !VALID_GOALS.includes(purpose)) {
      return new Response(
        JSON.stringify({ error: `Некорректное значение поля "Цель". Допустимые значения: ${VALID_GOALS.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    if (isFree) url.searchParams.set('is_free', 'true');

    console.log('Generating scenario for user:', userId || 'anonymous');
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    console.log('Webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error, status:', response.status);
      return new Response(
        JSON.stringify({ error: `Ошибка webhook: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseText = await response.text();
    console.log('Webhook response received successfully');

    let fullText: string;
    try {
      const parsed = JSON.parse(responseText);
      // Handle array format: [{ "output": "..." }]
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
        fullText = parsed[0].output;
      } else if (parsed.scenario) {
        fullText = parsed.scenario;
      } else if (parsed.output) {
        fullText = parsed.output;
      } else {
        fullText = responseText;
      }
    } catch {
      fullText = responseText;
    }

    // Extract substantial preview (first 4000 characters to show value)
    const preview = fullText.length > 4000 
      ? fullText.substring(0, 4000) 
      : fullText;

    // Save scenario to database for tracking and future payment
    // Using service_role to bypass RLS for anonymous users
    let scenarioId: string | null = null;

    const { data: scenarioData, error: insertError } = await supabase
      .from('scenarios')
      .insert({
        user_id: userId, // can be null for anonymous users
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
        is_paid: isFree, // Free scenarios are already "paid"
        is_free: isFree,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving scenario:', insertError);
      // For anonymous users, still return success with the scenario text
      // But without scenarioId (they won't be able to pay later)
      console.log('Continuing without saving scenario for anonymous user');
    } else {
      scenarioId = scenarioData.id;
      console.log(`Scenario saved with ID: ${scenarioId}`);
    }

    // Return response - always return preview even if saving failed
    // For anonymous free scenarios, scenarioId can be null
    return new Response(JSON.stringify({
      preview,
      scenarioId: scenarioId || 'anonymous', // Use placeholder for anonymous
      fullText: isFree ? fullText : undefined, // Send full text only for free scenarios
      isFree,
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
