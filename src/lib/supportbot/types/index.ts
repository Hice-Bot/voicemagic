export interface SupportBotConfig {
  /** OpenRouter model slug to use */
  model: string;
  /** System prompt for the AI */
  systemPrompt: string;
  /** Message shown when widget first opens */
  welcomeMessage: string;
  /** Widget title displayed in the header */
  title: string;
  /** Placeholder text in the input field */
  inputPlaceholder: string;
  /** Whether to show the widget by default */
  defaultOpen: boolean;
  /** Theme accent color (CSS color string) */
  accentColor: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface SupportBotProps {
  /** API endpoint - defaults to /api/support-chat */
  apiEndpoint?: string;
  /** Override config (merged over server config) */
  config?: Partial<SupportBotConfig>;
  /** Custom className for the widget container */
  className?: string;
}

export interface AdminConfigProps {
  /** Current config values */
  config: SupportBotConfig;
  /** Called when user saves updated config */
  onSave: (config: SupportBotConfig) => Promise<unknown> | void;
  /** Optional className */
  className?: string;
}

export interface ChatApiRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  config?: Partial<SupportBotConfig>;
}

export interface ChatApiHandlerOptions {
  /** Returns the current config for this installation */
  getConfig: () => Promise<SupportBotConfig> | SupportBotConfig;
  /** Your OpenRouter API key, or omit to use OPENROUTER_API_KEY env var */
  apiKey?: string;
}

export const DEFAULT_CONFIG: SupportBotConfig = {
  model: "minimax/minimax-m3",
  systemPrompt:
    "You are a helpful support assistant. Answer questions clearly and concisely. If you don't know something, say so honestly.",
  welcomeMessage: "Hi! How can I help you today?",
  title: "Support",
  inputPlaceholder: "Type a message...",
  defaultOpen: false,
  accentColor: "#6366f1",
};
