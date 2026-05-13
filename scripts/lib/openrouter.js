const fs = require('fs');
const path = require('path');

try { require('dotenv').config(); } catch (e) {}

/**
 * OpenRouter client with fallback chain (free tier optimized).
 */

const MODELS_FREE = [
  { name: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (Free)' },
  { name: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (Free)' },
  { name: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (Free)' },
  { name: 'openrouter/auto', label: 'Auto Free Router' }
];

const MODEL_PREMIUM_FALLBACK = { name: 'anthropic/claude-3-haiku', label: 'Claude Haiku ($)' };

function getApiKey() {
  return process.env.OPENROUTER_API_KEY || null;
}

async function callOpenRouter(model, messages, opts = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Brak OPENROUTER_API_KEY w .env');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://gajowkawegorzewo.pl',
      'X-Title': 'Gajowka Blog Bot'
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature: opts.temperature || 0.7,
      max_tokens: opts.max_tokens || 2000
    }),
    signal: AbortSignal.timeout(45000)
  });

  const data = await response.json();
  
  if (response.ok && data.choices?.[0]?.message) {
    return data.choices[0].message;
  } else {
    const errorMsg = data.error?.message || JSON.stringify(data);
    throw new Error(`HTTP ${response.status}: ${errorMsg}`);
  }
}

async function chat(messages, opts = {}) {
  const errors = [];
  
  for (const model of MODELS_FREE) {
    try {
      console.log(`[AI] Próba: ${model.label}...`);
      return await callOpenRouter(model, messages, opts);
    } catch (e) {
      console.warn(`[AI] ${model.label} failed: ${e.message}`);
      errors.push(`${model.name}: ${e.message}`);
      // Krótka przerwa przed kolejną próbą
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Premium fallback if explicitly requested
  if (opts.allowPremium) {
    try {
      console.log(`[AI] Próba Premium: ${MODEL_PREMIUM_FALLBACK.label}...`);
      return await callOpenRouter(MODEL_PREMIUM_FALLBACK, messages, opts);
    } catch (e) {
      errors.push(`${MODEL_PREMIUM_FALLBACK.name}: ${e.message}`);
    }
  }

  throw new Error('OpenRouter all models failed:\n' + errors.join('\n'));
}

module.exports = { chat };
