import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Проанализируй этот видеосценарий и дай конкретные рекомендации:

СЦЕНАРИЙ:
${text}

Верни JSON в формате:
{
  "suggestions": [
    {
      "position": число (примерная позиция в тексте, с какого символа начинается проблема),
      "length": число (длина фрагмента с проблемой),
      "type": "engagement" | "cta" | "filler" | "other",
      "message": "краткое описание проблемы",
      "severity": "low" | "medium" | "high"
    }
  ],
  "timing": {
    "totalSeconds": число (общее время озвучки при 150 словах/минуту),
    "phrases": [
      {
        "text": "текст фразы",
        "seconds": число (время озвучки этой фразы)
      }
    ]
  }
}

Типы проблем:
- engagement: низкая вовлечённость, скучный фрагмент
- cta: слабый призыв к действию или его отсутствие
- filler: вода, лишние слова
- other: другие проблемы`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по видеомаркетингу и сценариям. Анализируй тексты и давай конкретные рекомендации. Отвечай только валидным JSON без дополнительного текста.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    let jsonContent = content;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    const analysis = JSON.parse(jsonContent);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-scenario function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
