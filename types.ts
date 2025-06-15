
export interface MemoFicheFormData {
  subject: string;
  title: string;
  youtubeLink: string;
  podcastLink: string;
  aiText: string;
}

export interface MemoFicheGenerationInput {
  subject: string;
  title?: string;
  youtubeLink?: string;
  podcastLink?: string;
  additionalContext?: string;
}

// If you have a specific structure for the AI's response (e.g., JSON mode)
// export interface GeneratedMemoFicheContent {
//   title: string;
//   summary: string;
//   keyPoints: string[];
//   // ... other fields
// }

// Define Part type based on Gemini API if needed for image uploads to Gemini
// This is a simplified version for context.
export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}
