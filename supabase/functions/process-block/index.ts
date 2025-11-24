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
    const { text, action, context } = await req.json();
    
    if (!text || !action) {
      throw new Error('Text and action are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let prompt = '';
    
    switch (action) {
      case 'regenerate':
        prompt = `Перепиши этот блок сценария 5 разными способами, сохраняя смысл:\n\n${text}\n\nВерни JSON: {"variants": ["вариант1", "вариант2", "вариант3", "вариант4", "вариант5"]}`;
        break;
      case 'shorten':
        prompt = `Сократи этот текст в 1.5-2 раза, оставив главное:\n\n${text}\n\nВерни JSON: {"result": "сокращенный текст"}`;
        break;
      case 'lengthen':
        prompt = `Расширь этот текст, добавив детали и примеры:\n\n${text}\n\nВерни JSON: {"result": "расширенный текст"}`;
        break;
      case 'add_question':
        prompt = `Добавь в конец этого блока вопрос к зрителю, который усилит вовлечённость:\n\n${text}\n\nВерни JSON: {"result": "текст с вопросом"}`;
        break;
      case 'emotion':
        const emotion = context?.emotion || 'надежда';
        prompt = `Усиль эмоцию "${emotion}" в этом тексте:\n\n${text}\n\nВерни JSON: {"result": "текст с усиленной эмоцией"}`;
        break;
      case 'tone':
        const tone = context?.tone || 'дружелюбный';
        prompt = `Перепиши этот текст в ${tone} тоне:\n\n${text}\n\nВерни JSON: {"result": "текст в новом тоне"}`;
        break;
      case 'analyze':
        prompt = `Оцени качество этого блока сценария от 1 до 10 по критериям:
- engagement (вовлечённость)
- clarity (ясность)
- emotion (эмоциональность)
- hook_strength (сила зацепки)

Текст: ${text}

Верни JSON: {
  "score": число от 1 до 10,
  "engagement": число от 1 до 10,
  "clarity": число от 1 до 10,
  "emotion": число от 1 до 10,
  "hook_strength": число от 1 до 10,
  "feedback": "краткая рекомендация"
}`;
        break;
      default:
        throw new Error('Unknown action');
    }

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
            content: 'Ты эксперт по видеомаркетингу. Отвечай только валидным JSON без markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
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
    
    const result = JSON.parse(jsonContent);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-block function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
