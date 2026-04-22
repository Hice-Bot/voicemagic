import { createChatHandler } from "@/lib/supportbot/api";
import { DEFAULT_CONFIG } from "@/lib/supportbot";
import { prisma } from "@/lib/db";

export const POST = createChatHandler({
  getConfig: async () => {
    const cfg = await prisma.supportConfig.findFirst({
      include: { knowledgeBase: { orderBy: { sortOrder: "asc" } } },
    });
    if (!cfg) return DEFAULT_CONFIG;

    const { knowledgeBase, ...base } = cfg;
    if (knowledgeBase.length === 0) return base;

    const kbSection = knowledgeBase
      .map((doc) => `## ${doc.title}\n\n${doc.content}`)
      .join("\n\n---\n\n");

    return {
      ...base,
      systemPrompt: `${base.systemPrompt}\n\n---\n\n# Knowledge Base\n\n${kbSection}`,
    };
  },
});
