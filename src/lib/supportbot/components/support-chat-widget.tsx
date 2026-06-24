"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import { useChat } from "../hooks/use-chat";
import type { SupportBotConfig, SupportBotProps } from "../types";
import { DEFAULT_CONFIG } from "../types";
import { cn } from "../lib/utils";

interface ChatBubbleProps {
  open: boolean;
  onClick: () => void;
  accentColor: string;
}

function ChatBubble({ open, onClick, accentColor }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close support chat" : "Open support chat"}
      style={{ backgroundColor: accentColor }}
      className="fixed bottom-5 right-5 z-[9998] flex size-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <span style={{ display: open ? "none" : "block" }}>
        {/* Chat icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </span>
      <span style={{ display: open ? "block" : "none" }}>
        {/* X icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    </button>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-[var(--sb-accent)] text-white"
            : "rounded-bl-sm bg-gray-100 text-gray-900"
        )}
      >
        {content || (
          <span className="inline-flex gap-1">
            <span className="animate-bounce">·</span>
            <span className="animate-bounce [animation-delay:0.15s]">·</span>
            <span className="animate-bounce [animation-delay:0.3s]">·</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function SupportChatWidget({
  apiEndpoint = "/api/support-chat",
  config: configOverride,
  className,
}: SupportBotProps) {
  const config: SupportBotConfig = { ...DEFAULT_CONFIG, ...configOverride };
  const [open, setOpen] = useState(config.defaultOpen);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, sendMessage, reset } = useChat(apiEndpoint, configOverride);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    function handleSupportOpen() {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    window.addEventListener("voicemagic:support-open", handleSupportOpen);
    return () => {
      window.removeEventListener("voicemagic:support-open", handleSupportOpen);
    };
  }, []);

  function handleToggle() {
    setOpen((v) => !v);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (!started) setStarted(true);
    sendMessage(input);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  function handleNewChat() {
    reset();
    setStarted(false);
  }

  const showWelcome = !started && messages.length === 0;

  return (
    <>
      <style>{`
        :root { --sb-accent: ${config.accentColor}; }
        .sb-panel { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      `}</style>

      {/* Panel */}
      <div
        className={cn(
          "sb-panel fixed bottom-24 right-5 z-[9997] flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 transition-all duration-300",
          open ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4",
          className
        )}
        style={{ width: 360, height: 520 }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between rounded-t-2xl px-4 py-3 text-white"
          style={{ backgroundColor: config.accentColor }}
        >
          <span className="text-sm font-semibold">{config.title}</span>
          <button
            onClick={handleNewChat}
            title="New chat"
            className="rounded p-1 opacity-80 hover:opacity-100 transition-opacity focus:outline-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {showWelcome ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center px-6">
                <div
                  className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${config.accentColor}20` }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={config.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800">{config.welcomeMessage}</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}
          {error && (
            <p className="text-center text-xs text-red-500">{error}</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-gray-100 px-3 py-2.5 flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.inputPlaceholder}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--sb-accent)] disabled:opacity-50 max-h-32 min-h-[36px]"
            style={{ overflowY: "auto" }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: config.accentColor }}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      <ChatBubble open={open} onClick={handleToggle} accentColor={config.accentColor} />
    </>
  );
}
