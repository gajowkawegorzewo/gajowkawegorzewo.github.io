const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

try { require('dotenv').config(); } catch (e) {}

/**
 * OpenRouter client with fallback chain (free tier optimized).
 * Uses Gemini Flash 1.5 and Llama 3 for best quality/cost ratio.
 */

const MODELS_FREE = [
  { name: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (Free)' },
  { name: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (Free)' },
  { name: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (Free)' },
  { name: 'openrouter/auto', label: 'Auto Free Router' }
];

const MODEL_PREMIUM_FALLBACK = { name: 'anthropic/claude-3-haiku', label: 'Claude Haiku ($)' };

function getApiKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  
  // Local .env fallback
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/OPENROUTER_API_KEY\s*=\s*(.+)/);
      if (match) return match[1].trim().replace(/['"]/g, '');
    }
  } catch (e) {}
  return null;
}

async function callOpenRouter(model, messages, opts = {}) {
  const key = getApiKey();
  if (!key) throw new Error('OPENROUTER_API_KEY missing in env or .env');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://gajowkawegorzewo.pl',
      'X-Title': 'Gajowka Blog Bot'
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 4000
    }),
    signal: AbortSignal.timeout(60000)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${model.name} HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`OpenRouter ${model.name} pusta odpowiedz`);
  }

  return { content, model: model.name };
}

async function chat(messages, opts = {}) {
  const errors = [];
  
  // Try free models first
  for (const model of MODELS_FREE) {
    try {
      console.log(`[AI] Próba: ${model.label}...`);
      return await callOpenRouter(model, messages, opts);
    } catch (e) {
      console.warn(`[AI] ${model.label} failed: ${e.message}`);
      errors.push(`${model.name}: ${e.message}`);
      // Wait a bit before next attempt (rate limits)
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Premium fallback if enabled
  if (opts.usePremiumFallback) {
    try {
      console.log(`[AI] Próba fallback: ${MODEL_PREMIUM_FALLBACK.label}...`);
      return await callOpenRouter(MODEL_PREMIUM_FALLBACK, messages, opts);
    } catch (e) {
      errors.push(`${MODEL_PREMIUM_FALLBACK.name}: ${e.message}`);
    }
  }

  throw new Error('OpenRouter all models failed:\n' + errors.join('\n'));
}

module.exports = { chat };
