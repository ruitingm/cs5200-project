// frontend/src/AIChat/AIChat.tsx

import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  callNL2SQL,
  formatNL2SQLResult,
  type NL2SQLResponse,
} from "../api/chat";
import LLMProblemCreation from "./LLMProblemCreation";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: number;
  role: ChatRole;
  text: string;
}

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRawResponse, setLastRawResponse] = useState<NL2SQLResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);

    // append user message
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await callNL2SQL(trimmed);
      setLastRawResponse(res);
      const assistantText = formatNL2SQLResult(res);

      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: assistantText,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(msg);

      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: `❌ Failed to call backend: ${msg}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)] border rounded-xl shadow-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div className="font-semibold text-slate-800">
          Natural Language → SQL Assistant
        </div>
        <Link
          to="llm-problem-creation"
          className="text-sm text-rose-700 hover:text-rose-900 underline"
        >
          LLM Problem Creation
        </Link>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-slate-50">
        {messages.length === 0 && (
          <div className="text-slate-500">
            Ask a question such as:
            <ul className="list-disc list-inside mt-1">
              <li>"Show me all problems tagged as EASY."</li>
              <li>
                "How many problems did account 10001 submit in the last 7 days?"
              </li>
              <li>
                "List all submissions with their problem description for account
                10001."
              </li>
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 ${
                m.role === "user"
                  ? "bg-rose-600 text-white"
                  : "bg-white border border-slate-200 text-slate-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Optional raw JSON debug panel */}
      {lastRawResponse && (
        <div className="border-t bg-slate-100 px-4 py-2 text-xs text-slate-600">
          <details>
            <summary className="cursor-pointer">
              Raw response (for debugging / demo)
            </summary>
            <pre className="mt-1 max-h-40 overflow-auto">
              {JSON.stringify(lastRawResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 text-xs text-red-600 border-t bg-red-50">
          {error}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t bg-white">
        <input
          type="text"
          placeholder="Ask in natural language…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-md text-sm font-medium bg-rose-700 text-white disabled:bg-slate-300 disabled:text-slate-500 hover:bg-rose-800 transition"
        >
          {isLoading ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default function AIChat() {
  return (
    <Routes>
      <Route path="/" element={<ChatPanel />} />
      <Route path="llm-problem-creation" element={<LLMProblemCreation />} />
    </Routes>
  );
}
