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
    const { idea, contentType, audience } = await req.json();

    console.log("Generating scenario with:", { idea, contentType, audience });

    // Формируем URL с параметрами для GET запроса
    const webhookUrl = new URL("https://lvmnai.ru/webhook/dc2ac900-e689-4421-8f0f-cb4358f4f0a0");
    webhookUrl.searchParams.set('idea', idea);
    webhookUrl.searchParams.set('contentType', contentType);
    webhookUrl.searchParams.set('audience', audience);
    webhookUrl.searchParams.set('mood', 'creative');

    console.log("Requesting webhook URL:", webhookUrl.toString());
    
    const response = await fetch(webhookUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    console.log("Webhook response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webhook error:", errorText);
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
