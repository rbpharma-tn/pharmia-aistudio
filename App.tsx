
import React, { useState, useCallback } from 'react';
import { InputField } from './components/InputField';
import { CustomFileInput } from './components/CustomFileInput';
import { ClipboardDocumentIcon, ArrowsRightLeftIcon, ArrowUpTrayIcon, LoadingSpinnerIcon } from './components/Icons';
import { generateMemoFicheContent, fileToText } from './services/geminiService';
import type { MemoFicheFormData } from './types';

const App: React.FC = () => {
  const [formData, setFormData] = useState<MemoFicheFormData>({
    subject: '',
    title: '',
    youtubeLink: '',
    podcastLink: '',
    aiText: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aiDocFiles, setAiDocFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePhotoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    } else {
      setPhotoFile(null);
    }
  }, []);

  const handleAiDocsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAiDocFiles(e.target.files);
    } else {
      setAiDocFiles(null);
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!process.env.API_KEY || process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        setError("Veuillez configurer votre clé API Gemini dans index.html ou via les variables d'environnement.");
        return;
    }
    setLoading(true);
    setError(null);
    setGeneratedContent('');

    let additionalContextText = formData.aiText;

    if (aiDocFiles && aiDocFiles.length > 0) {
      try {
        const fileContents = await Promise.all(
          Array.from(aiDocFiles).map(async (file) => {
            if (file.type.startsWith("text/")) {
              return fileToText(file);
            }
            return `[Contenu du fichier ${file.name} (type: ${file.type}) non extrait car non textuel.]`;
          })
        );
        additionalContextText = `${additionalContextText}\n\n--- Documents Fournis ---\n${fileContents.join('\n\n---\n\n')}`.trim();
      } catch (fileReadError) {
        console.error("Erreur lors de la lecture des fichiers :", fileReadError);
        setError("Erreur lors de la lecture d'un des fichiers fournis.");
        setLoading(false);
        return;
      }
    }
    
    // The photoFile is not sent to Gemini in this version, it's for the UI.
    // If it were to be used by Gemini, it would need to be converted to a Part object.

    try {
      const result = await generateMemoFicheContent({
        subject: formData.subject,
        title: formData.title,
        youtubeLink: formData.youtubeLink,
        podcastLink: formData.podcastLink,
        additionalContext: additionalContextText.trim() || undefined, // Send undefined if empty
      });
      setGeneratedContent(result);
    } catch (err: any) {
      console.error("Erreur API Gemini:", err);
      setError(err.message || "Erreur lors de la génération de la mémofiche.");
    } finally {
      setLoading(false);
    }
  }, [formData, aiDocFiles]);


  const getAIDocsDisplay = (): string => {
    if (!aiDocFiles || aiDocFiles.length === 0) return "Aucun fichier choisi";
    if (aiDocFiles.length === 1) return aiDocFiles[0].name;
    return `${aiDocFiles.length} fichiers choisis`;
  };

  return (
    <div className="min-h-screen py-8 px-4 flex justify-center items-start">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">
          Générateur de Mémofiches
        </h1>

        <div className="mb-6 flex space-x-3">
          <button
            type="button"
            className="flex-1 text-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 flex items-center justify-center"
          >
            <ClipboardDocumentIcon className="w-5 h-5 mr-2 text-slate-600" />
            Ajouter dans la base
          </button>
          <button
            type="button"
            className="flex-1 text-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center"
          >
            <ArrowsRightLeftIcon className="w-5 h-5 mr-2 text-sky-600" />
            Sources IA
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Entrez un sujet"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="ex : Otite du nourrisson"
            required
          />

          <CustomFileInput
            label="Photo Mémofiche"
            id="photoFile"
            onChange={handlePhotoFileChange}
            selectedFileDisplay={photoFile ? photoFile.name : "Aucun fichier choisi"}
            buttonText="Choisir un fichier"
            accept="image/*"
          />

          <InputField
            label="Titre Mémofiche"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Titre de la mémofiche"
          />

          <InputField
            label="Lien Youtube"
            id="youtubeLink"
            name="youtubeLink"
            type="url"
            value={formData.youtubeLink}
            onChange={handleInputChange}
            placeholder="https://youtube.com/xxx"
          />

          <InputField
            label="Lien podcast"
            id="podcastLink"
            name="podcastLink"
            type="url"
            value={formData.podcastLink}
            onChange={handleInputChange}
            placeholder="https://podcast.com/xxx"
          />

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-gray-700" />
              <h3 className="text-md font-semibold text-gray-700">
                Ajouter documents ou extraits pour l'IA (optionnel)
              </h3>
            </div>
            <CustomFileInput
              label="Sélect. fichiers"
              id="aiDocFiles"
              onChange={handleAiDocsChange}
              selectedFileDisplay={getAIDocsDisplay()}
              buttonText="Sélect. fichiers"
              multiple
              accept=".txt,.md,.pdf,.doc,.docx" // Example, actual processing varies
            />
            <InputField
              label="Coller du texte ou extrait de cours (optionnel)"
              id="aiText"
              name="aiText"
              isTextArea
              value={formData.aiText}
              onChange={handleInputChange}
              placeholder="Collez ici votre cours, QCM, extrait de notice à fournir à l'IA..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading && <LoadingSpinnerIcon className="h-5 w-5 mr-2"/>}
            {loading ? 'Génération...' : 'Générer'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        {generatedContent && (
          <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-3 text-slate-700">Mémofiche Générée:</h3>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{generatedContent}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
