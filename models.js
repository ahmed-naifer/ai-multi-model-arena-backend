import 'dotenv/config';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export async function askGPT(question) {
  const response = await openai.chat.completions.create({
    model: 'gpt-5.4-nano',
    messages: [{ role: 'user', content: question }],
  });
  return response.choices[0].message.content;
}

export async function askClaude(question) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: question }],
  });
  return response.content[0].text;
}

export async function askGemini(question) {
  const response = await gemini.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: question,
  });
  return response.text;
}

export async function askDeepSeek(question) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: question }],
  });
  return response.choices[0].message.content;
}

export async function askAllModels(question) {
  const models = [
    { name: 'GPT-5.4 Nano', fn: askGPT },
    { name: 'Claude Sonnet 5', fn: askClaude },
    { name: 'Gemini 3.1', fn: askGemini },
    { name: 'DeepSeek', fn: askDeepSeek },
  ];

  const results = await Promise.allSettled(
    models.map(model => model.fn(question))
  );

  return results.map((result, index) => {
    const modelName = models[index].name;
    if (result.status === 'fulfilled') {
      return { model: modelName, ok: true, reponse: result.value };
    } else {
      return { model: modelName, ok: false, erreur: result.reason.message };
    }
  });

}
export async function judgeResponses(question, resultats) {
  // On ne garde que les réponses qui ont réussi
  const reponsesOk = resultats.filter(r => r.ok);

  if (reponsesOk.length < 2) {
    return "Pas assez de réponses disponibles pour comparer (il en faut au moins 2).";
  }

  const prompt = `
Voici une question posée à plusieurs IA : "${question}"

Voici leurs réponses :
${reponsesOk.map(r => `--- ${r.model} ---\n${r.reponse}`).join('\n\n')}

Compare ces réponses et dis laquelle est la plus claire, précise et utile. 
Explique ton choix en 2-3 phrases.
`;

  const response = await gemini.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
  });

  return response.text;
}