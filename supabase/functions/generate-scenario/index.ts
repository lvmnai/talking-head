import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    let resultData;
    try {
      resultData = JSON.parse(responseText);
    } catch {
      resultData = { scenario: responseText };
    }

    return new Response(JSON.stringify(resultData), {
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
