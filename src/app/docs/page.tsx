import Link from "next/link";

const BASE_URL = "https://voicemagic.dev";

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre">
      {code}
    </pre>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 border-b border-zinc-200 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EndpointCard({
  method,
  path,
  description,
  requestBody,
  responseShape,
  curlExample,
}: {
  method: "GET" | "POST";
  path: string;
  description: string;
  requestBody?: string;
  responseShape: string;
  curlExample: string;
}) {
  const methodColor =
    method === "POST"
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-zinc-50">
        <span
          className={`text-xs font-bold tracking-wider px-2 py-0.5 rounded-md ${methodColor}`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-zinc-800 font-medium">
          {path}
        </code>
      </div>
      <div className="flex flex-col gap-5 px-5 py-5">
        <p className="text-sm text-zinc-600">{description}</p>

        {requestBody && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Request body
            </p>
            <CodeBlock code={requestBody} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Response
          </p>
          <CodeBlock code={responseShape} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            cURL example
          </p>
          <CodeBlock code={curlExample} />
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-14">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">VM</span>
            </div>
            <span className="text-sm font-medium text-zinc-500">
              Voicemagic API
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            API Reference
          </h1>
          <p className="text-zinc-600 max-w-xl leading-relaxed">
            The Voicemagic REST API lets you generate speech, manage voices, and
            retrieve generations programmatically. It also exposes an MCP server
            for AI agent integrations.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-zinc-500">Base URL</span>
            <code className="text-xs bg-zinc-200 text-zinc-800 px-2 py-1 rounded font-mono">
              {BASE_URL}
            </code>
          </div>
        </div>

        {/* Getting started */}
        <Section id="authentication" title="Authentication">
          <p className="text-sm text-zinc-600 leading-relaxed">
            All API requests require an API key passed as a Bearer token in the{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded font-mono">
              Authorization
            </code>{" "}
            header. Generate a key in your{" "}
            <Link
              href="/settings"
              className="text-zinc-900 underline underline-offset-2 hover:text-zinc-600"
            >
              Settings
            </Link>{" "}
            page.
          </p>
          <CodeBlock
            code={`Authorization: Bearer vm_your_api_key_here`}
          />
          <p className="text-sm text-zinc-600 leading-relaxed">
            API keys are scoped to your organization. They grant access to your
            organization&apos;s custom voices and generations. Store them
            securely — you will only see the full key once when it is created.
          </p>
        </Section>

        {/* Endpoints */}
        <Section id="endpoints" title="Endpoints">
          <div className="flex flex-col gap-6">
            <EndpointCard
              method="GET"
              path="/api/v1/voices"
              description="List all available voices — both system voices shared across all organizations, and custom voices you have created."
              responseShape={`{
  "voices": [
    {
      "id": "clx...",
      "name": "Sarah",
      "description": "Warm and conversational",
      "category": "CONVERSATIONAL",
      "language": "en-US",
      "variant": "SYSTEM"
    }
  ]
}`}
              curlExample={`curl ${BASE_URL}/api/v1/voices \\
  -H "Authorization: Bearer vm_your_api_key"`}
            />

            <EndpointCard
              method="POST"
              path="/api/v1/tts"
              description="Generate speech from text. Returns a generation ID and an audio URL. Consumes metered credits."
              requestBody={`{
  "text": "Hello from Voicemagic!",
  "voiceId": "clx...",
  "temperature": 0.8,
  "topP": 0.95,
  "topK": 1000,
  "repetitionPenalty": 1.2
}`}
              responseShape={`{
  "id": "clx...",
  "audioUrl": "/api/v1/audio/clx..."
}`}
              curlExample={`curl -X POST ${BASE_URL}/api/v1/tts \\
  -H "Authorization: Bearer vm_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello from Voicemagic!",
    "voiceId": "clx..."
  }'`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/audio/{id}"
              description="Stream the WAV audio for a generation by its ID. Returns the raw audio bytes with Content-Type: audio/wav."
              responseShape={`<binary WAV audio stream>`}
              curlExample={`curl ${BASE_URL}/api/v1/audio/clx... \\
  -H "Authorization: Bearer vm_your_api_key" \\
  --output speech.wav`}
            />

            <EndpointCard
              method="GET"
              path="/api/v1/generations/{id}"
              description="Retrieve metadata and the audio URL for a specific generation."
              responseShape={`{
  "id": "clx...",
  "text": "Hello from Voicemagic!",
  "voiceName": "Sarah",
  "voiceId": "clx...",
  "temperature": 0.8,
  "topP": 0.95,
  "topK": 1000,
  "repetitionPenalty": 1.2,
  "createdAt": "2026-04-21T12:00:00.000Z",
  "audioUrl": "/api/v1/audio/clx..."
}`}
              curlExample={`curl ${BASE_URL}/api/v1/generations/clx... \\
  -H "Authorization: Bearer vm_your_api_key"`}
            />
          </div>
        </Section>

        {/* MCP */}
        <Section id="mcp" title="MCP Server">
          <p className="text-sm text-zinc-600 leading-relaxed">
            Voicemagic exposes a{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 underline underline-offset-2 hover:text-zinc-600"
            >
              Model Context Protocol
            </a>{" "}
            (MCP) server, allowing AI agents like Claude to generate speech
            directly.
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Endpoint
            </p>
            <CodeBlock code={`${BASE_URL}/api/mcp`} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Available tools
            </p>
            <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
              {[
                {
                  name: "list_voices",
                  description:
                    "Lists all available system and custom voices for your organization.",
                },
                {
                  name: "generate_speech",
                  description:
                    "Generates TTS audio from text using a specified voice. Returns an audio URL.",
                },
                {
                  name: "get_generation",
                  description:
                    "Retrieves generation metadata and the audio URL for a given generation ID.",
                },
              ].map((tool) => (
                <div key={tool.name} className="flex flex-col gap-0.5 px-4 py-3">
                  <code className="text-sm font-mono font-medium text-zinc-900">
                    {tool.name}
                  </code>
                  <p className="text-xs text-zinc-500">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Add to Claude Code (claude_code_config.json)
            </p>
            <CodeBlock
              code={`{
  "mcpServers": {
    "voicemagic": {
      "type": "http",
      "url": "${BASE_URL}/api/mcp",
      "headers": {
        "Authorization": "Bearer vm_your_api_key"
      }
    }
  }
}`}
            />
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-zinc-200 pt-8 flex items-center justify-between text-xs text-zinc-400">
          <span>Voicemagic API — v1</span>
          <Link
            href="/"
            className="hover:text-zinc-600 transition-colors"
          >
            Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
