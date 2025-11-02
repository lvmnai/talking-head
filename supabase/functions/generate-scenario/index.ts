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
    const { idea, contentType, audience, purpose, tone, format } = await req.json();
    
    if (!idea || !contentType || !audience || !purpose || !tone || !format) {
      console.error('Missing required fields:', { idea, contentType, audience, purpose, tone, format });
      return new Response(
        JSON.stringify({ 
          error: 'Отсутствуют обязательные поля',
          details: 'Все поля формы обязательны для заполнения'
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const base = 'https://lvmnai.ru/webhook/dc2ac900-e689-4421-8f0f-cb4358f4f0a0';
    const url = new URL(base);
    url.searchParams.set('idea', idea);
    url.searchParams.set('channel', contentType);
    url.searchParams.set('audience', audience);
    url.searchParams.set('purpose', purpose);
    url.searchParams.set('tone', tone);
    url.searchParams.set('format', format);
    url.searchParams.set('mood', 'creative');

    console.log('Отправка GET на webhook:', url.toString());
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
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
    console.log("Webhook response:", responseText);

    let resultData;
    try {
      resultData = JSON.parse(responseText);
    } catch {
      resultData = { scenario: responseText };
    }

    return new Response(
      JSON.stringify(resultData), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in generate-scenario function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Неизвестная ошибка" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
