import type { ChatSuggestion } from "../types/chatbot.types";

export const CHAT_SUGGESTIONS: readonly ChatSuggestion[] = [
  {
    id: "top-dishes",
    label: "Plats les plus vendus",
    prompt: "Quels sont les plats les plus vendus cette semaine ?",
    category: "Ventes",
  },
  {
    id: "stock-alerts",
    label: "Alertes de stocks",
    prompt: "Quels sont les articles en rupture ou en stock critique ?",
    category: "Inventaire",
  },
  {
    id: "staff-planning",
    label: "Planning d'aujourd'hui",
    prompt: "Affiche le planning du personnel prévu pour la journée d'aujourd'hui.",
    category: "RH",
  },
  {
    id: "daily-revenue",
    label: "Revenus récents",
    prompt: "Quel est le chiffre d'affaires généré par le restaurant hier ?",
    category: "Finances",
  },
] as const;

export const CHAT_CONFIG = {
  title: "Assistant Sooatel & Utopia",
  subtitle: "Intelligence artificielle de gestion hôtelière et restauration",
  name: "Sooatel IA",
  placeholder: "Posez votre question (ex: stocks, recettes, plannings...)...",
  thinkingText: "L'assistant réfléchit...",
  errorText: "Une erreur est survenue lors de la communication avec l'assistant.",
  retryText: "Réessayer",
  stopText: "Arrêter",
  sendText: "Envoyer",
} as const;

export const TOOL_LABELS: Record<string, string> = {
  recherche_rag: "Recherche dans la base de connaissances...",
};
