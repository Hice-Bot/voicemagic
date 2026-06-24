import { createChatHandler } from "@/lib/supportbot/api";
import { prisma } from "@/lib/db";
import {
  VOICEMAGIC_SUPPORT_CONFIG,
  VOICEMAGIC_SUPPORT_KNOWLEDGE,
} from "@/lib/supportbot/voicemagic-support";

export const POST = createChatHandler({
  getConfig: async () => {
    const cfg = await prisma.supportConfig.findFirst({
      include: { knowledgeBase: { orderBy: { sortOrder: "asc" } } },
    });
    if (!cfg) return VOICEMAGIC_SUPPORT_CONFIG;

    const { knowledgeBase, ...base } = cfg;
    const standardKnowledge = `# Voicemagic Knowledge\n\n${VOICEMAGIC_SUPPORT_KNOWLEDGE}`;
    if (knowledgeBase.length === 0) {
      return {
        ...base,
        systemPrompt: `${base.systemPrompt}\n\n---\n\n${standardKnowledge}`,
      };
    }

    const kbSection = knowledgeBase
      .map((doc) => `## ${doc.title}\n\n${doc.content}`)
      .join("\n\n---\n\n");

    return {
      ...base,
      systemPrompt: `${base.systemPrompt}\n\n---\n\n${standardKnowledge}\n\n---\n\n# Admin Knowledge Base\n\n${kbSection}`,
    };
  },
});
