// index.js
import 'dotenv/config';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// On crée un "client" qui va s'authentifier avec ta clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askGPT(question) {
  const response = await openai.chat.completions.create({
    model: 'gpt-5.4-nano',
    messages: [
      { role: 'user', content: question },
    ],
  });

  return response.choices[0].message.content;
}

// Test



const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askGemini(question) {
  const response = await gemini.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: question,
  });

  return response.text;
}
// On crée un DEUXIÈME client OpenAI, mais pointé vers les serveurs de DeepSeek
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

async function askDeepSeek(question) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'user', content: question },
    ],
  });

  return response.choices[0].message.content;
}

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function askClaude(question) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1000,
    messages: [
      { role: 'user', content: question },
    ],
  });

  return response.content[0].text;
}

async function askAllModels(question) {
  const models = [
    { name: 'GPT-5.4 Nano', fn: askGPT },
    { name: 'Claude Sonnet 5', fn: askClaude },
    { name: 'Gemini 3.1', fn: askGemini },
    { name: 'DeepSeek', fn: askDeepSeek },
  ];

  // On lance les 4 appels EN MÊME TEMPS
  const results = await Promise.allSettled(
    models.map(model => model.fn(question))
  );

  // On reconstruit un résultat propre et lisible
  const reponses = results.map((result, index) => {
    const modelName = models[index].name;

    if (result.status === 'fulfilled') {
      return { model: modelName, ok: true, reponse: result.value };
    } else {
      return { model: modelName, ok: false, erreur: result.reason.message };
    }
  });

  return reponses;
}

// Test
const question = "Explique-moi ce qu'est une API en une phrase simple.";
const resultats = await askAllModels(question);

console.log(`\n🎯 Question : "${question}"\n`);
resultats.forEach(r => {
  console.log(`--- ${r.model} ---`);
  if (r.ok) {
    console.log(`✅ ${r.reponse}`);
  } else {
    console.log(`❌ Indisponible : ${r.erreur}`);
  }
  console.log('');
});