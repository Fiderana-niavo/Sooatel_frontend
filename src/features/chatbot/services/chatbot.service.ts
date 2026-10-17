import axios from "axios";
import type {
  ChatModelAdapter,
  ChatModelRunOptions,
  ChatModelRunResult,
} from "@assistant-ui/core";
import type { ChatApiRequest, ChatApiResponse } from "../types/chatbot.types";
import { wait } from "../utils/chatbot.utils";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ─── Session State ────────────────────────────────────────────────────────────
// Keeps the sessionId across messages in the same runtime instance.

let currentSessionId: string | undefined;

export function resetSession(): void {
  currentSessionId = undefined;
}

// ─── API Call ─────────────────────────────────────────────────────────────────

async function sendMessage(
  message: string,
  signal: AbortSignal,
): Promise<ChatApiResponse> {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");

  const body: ChatApiRequest = {
    message,
    sessionId: currentSessionId,
  };

  try {
    const response = await axios.post(`${BASE}/chatbot`, body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal,
    });

    const payload = response.data?.payload;
    if (!payload) {
      throw new Error("Réponse inattendue du serveur.");
    }
    return payload as ChatApiResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      throw new Error(msg || "Erreur de communication avec l'assistant.");
    }
    throw error;
  }
}

// ─── Text Streamer ────────────────────────────────────────────────────────────
// Simulates a streaming effect by yielding word batches progressively.

async function* streamWords(
  text: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const tokens = text.split(/([\s]+)/);
  let accumulated = "";

  for (let i = 0; i < tokens.length; i++) {
    if (signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    accumulated += tokens[i];
    yield accumulated;

    if (i % 3 === 0) {
      await wait(14, signal);
    }
  }
}

// ─── Adapter Factory ──────────────────────────────────────────────────────────

export function createChatAdapter(): ChatModelAdapter {
  return {
    async *run(
      options: ChatModelRunOptions,
    ): AsyncGenerator<ChatModelRunResult, void> {
      const signal = options.abortSignal;

      // Extract text from the last user message
      const userMessage = [...options.messages]
        .reverse()
        .find((m) => m.role === "user");

      let query = "";
      if (userMessage?.content) {
        for (const part of userMessage.content) {
          if (part.type === "text") {
            query += part.text;
          }
        }
      }

      if (!query.trim()) {
        return;
      }

      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      // Fetch the answer from the backend RAG pipeline
      const data = await sendMessage(query, signal);

      // Persist the sessionId for conversation continuity
      if (data.sessionId) {
        currentSessionId = data.sessionId;
      }

      // Stream the answer progressively, word by word
      for await (const partial of streamWords(data.answer, signal)) {
        yield {
          content: [
            {
              type: "text",
              text: partial,
            },
          ],
        };
      }
    },
  };
}

