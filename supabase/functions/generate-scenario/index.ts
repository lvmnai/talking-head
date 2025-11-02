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

    const webhookUrl = 'https://lvmnai.ru/webhook/dc2ac900-e689-4421-8f0f-cb4358f4f0a0';
    
    const requestBody = {
      idea,
      channel: contentType,
      audience,
      purpose,
      tone,
      format,
    };

    console.log('Отправка POST запроса на webhook:', webhookUrl);
    console.log('Тело запроса:', JSON.stringify(requestBody, null, 2));
    
    let response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Webhook response status (POST):", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webhook error (POST):", errorText);

      // Если POST не поддерживается, пробуем GET с теми же параметрами
      if (response.status === 404 || /not registered for POST/i.test(errorText)) {
        const getUrl = new URL(webhookUrl);
        getUrl.searchParams.set('idea', idea);
        getUrl.searchParams.set('channel', contentType);
        getUrl.searchParams.set('audience', audience);
        getUrl.searchParams.set('purpose', purpose);
        getUrl.searchParams.set('tone', tone);
        getUrl.searchParams.set('format', format);
        getUrl.searchParams.set('mood', 'creative');

        console.log('Fallback to GET:', getUrl.toString());
        response = await fetch(getUrl.toString(), {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
      } else {
        return new Response(
          JSON.stringify({ 
            error: `Ошибка webhook: ${response.status}`,
            details: errorText 
          }), 
          {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
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
