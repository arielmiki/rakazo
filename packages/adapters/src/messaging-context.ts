import type { PrismaClient } from "@rakazo/db";

/**
 * Executor dep answering "does this bot belong to a messaging identity?" —
 * one indexed query per run, and none when the messaging surface is absent.
 * Also carries the deployment's bot reply tag (MESSAGING_BOT_REPLY_TAG) so
 * runs another bot started learn how to reach the owner's chat.
 */
export function createMessagingContextLoader(prisma: PrismaClient, botReplyTag?: string) {
  return {
    botReplyTag,
    hasIdentity: async (botId: string): Promise<boolean> =>
      Boolean(
        await prisma.messagingIdentity.findUnique({ where: { botId }, select: { id: true } }),
      ),
  };
}
