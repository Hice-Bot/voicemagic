import Link from "next/link";
import { Braces, ExternalLink, KeyRound, PlugZap, Terminal } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://voicemagic.dev";

const mcpConfig = `{
  "mcpServers": {
    "voicemagic": {
      "type": "http",
      "url": "${BASE_URL}/api/mcp",
      "headers": {
        "Authorization": "Bearer vm_your_api_key"
      }
    }
  }
}`;

const curlExample = `curl -X POST ${BASE_URL}/api/v1/tts \\
  -H "Authorization: Bearer vm_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello from Voicemagic.",
    "voiceId": "your_voice_id"
  }'`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100">
      <code>{code}</code>
    </pre>
  );
}

function StepCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof KeyRound;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export default function ApiMcpPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="API/MCP" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 p-7 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Braces className="size-3.5" />
                  REST API and MCP server
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Connect Voicemagic to apps and agents.
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Use API keys for server-to-server calls, or connect the MCP
                  endpoint so agent tools can list voices and generate speech.
                </p>
              </div>
              <Button asChild>
                <Link href="/settings">
                  <KeyRound className="size-4" />
                  Create API key
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Base URL
              </div>
              <code className="mt-2 block text-sm text-foreground">
                {BASE_URL}
              </code>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                MCP endpoint
              </div>
              <code className="mt-2 block text-sm text-foreground">
                /api/mcp
              </code>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                API version
              </div>
              <code className="mt-2 block text-sm text-foreground">
                /api/v1
              </code>
            </div>
          </div>

          <StepCard
            icon={KeyRound}
            title="1. Create an API key"
            description="Open Settings, create a named key, and copy it immediately. The full key is only shown once."
          >
            <Button variant="outline" asChild>
              <Link href="/settings">Open API key settings</Link>
            </Button>
          </StepCard>

          <StepCard
            icon={PlugZap}
            title="2. Connect an MCP client"
            description="Add Voicemagic as an HTTP MCP server and pass your API key in the Authorization header."
          >
            <CodeBlock code={mcpConfig} />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              After saving the config, restart your MCP client so it reloads the
              server list. The available tools include listing voices,
              generating speech, and retrieving generation details.
            </p>
          </StepCard>

          <StepCard
            icon={Terminal}
            title="3. Or call the REST API directly"
            description="Use the same API key as a Bearer token for API requests from your backend or automation scripts."
          >
            <CodeBlock code={curlExample} />
          </StepCard>

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Need endpoint-level details?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The public API reference includes request bodies, responses,
                and endpoint examples.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/docs">
                Read docs
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
