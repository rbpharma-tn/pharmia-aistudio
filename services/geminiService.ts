
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { MemoFicheGenerationInput } from '../types';

// This function assumes process.env.API_KEY is available.
// In a browser-only context without a build step, it might be window.process.env.API_KEY
// As per instructions, we use process.env.API_KEY directly.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY for Gemini is not configured. AI functionality will be disabled.");
}

export const generateMemoFicheContent = async (input: MemoFicheGenerationInput): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. Please configure API_KEY.");
  }

  const { subject, title, youtubeLink, podcastLink, additionalContext } = input;

  const promptParts: string[] = [];
  promptParts.push(`Génère une mémofiche (fiche de révision concise et bien structurée) sur le sujet suivant : "${subject}".`);

  if (title) {
    promptParts.push(`Le titre de la mémofiche pourrait être : "${title}". Tu peux l'adapter ou le reformuler si tu juges cela pertinent pour améliorer la clarté ou l'impact.`);
  }

  if (youtubeLink) {
    promptParts.push(`Considère les informations qui pourraient être extraites de cette vidéo YouTube (sans y naviguer directement, utilise le lien comme indice contextuel) : ${youtubeLink}.`);
  }
  if (podcastLink) {
    promptParts.push(`Considère les informations qui pourraient être extraites de ce podcast (sans y naviguer directement, utilise le lien comme indice contextuel) : ${podcastLink}.`);
  }

  if (additionalContext && additionalContext.trim() !== '') {
    promptParts.push(`Utilise également le contexte supplémentaire suivant fourni par l'utilisateur (textes, extraits de cours, etc.) pour enrichir la mémofiche :\n"""\n${additionalContext}\n"""`);
  }

  promptParts.push("La mémofiche doit être claire, facile à comprendre et à mémoriser. Mets en évidence les points clés, définitions importantes, et concepts essentiels. Utilise un langage simple et direct.");
  promptParts.push("Formatte la réponse en Markdown simple (titres, listes à puces, gras, italique si nécessaire).");

  const fullPrompt = promptParts.join('\n\n');

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17', // Recommended model
        contents: fullPrompt,
        // config: { temperature: 0.7 } // Optional: Adjust creativity
    });

    return response.text;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes('API key not valid')) {
        throw new Error("Clé API Gemini non valide. Veuillez vérifier votre configuration.");
    }
    throw new Error(`Erreur lors de la communication avec l'API Gemini: ${error.message || 'Erreur inconnue'}`);
  }
};

export const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Erreur lors de la lecture du fichier: contenu non textuel."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file); // Assumes text-based files
  });
};
