import { describe, expect, it } from "vitest";
import {
  isMessagingChannelRun,
  messagingChannelPrivacyBlock,
  messagingDmSurfaceNote,
  messagingRunContext,
} from "./messaging-prompts.js";

describe("messagingChannelPrivacyBlock", () => {
  it("forbids leaking owner data and allows silent finishes", () => {
    const block = messagingChannelPrivacyBlock();
    expect(block).toMatch(/never (reveal|share)/i);
    expect(block).toMatch(/personal information/i);
    expect(block).toMatch(/memory/i);
    expect(block).toMatch(/1:1/);
    expect(block).toMatch(/attributed/i);
    expect(block).toMatch(/silent/i);
  });
});

describe("isMessagingChannelRun", () => {
  const channelBlock = {
    kind: "channel_message" as const,
    provider: "sendblue",
    channelId: "ch-1",
    fromAddress: "+15551234567",
    fromLabel: "Alice",
    text: "hi",
  };

  it("detects channel runs from the source message blocks", () => {
    expect(isMessagingChannelRun("messaging", [channelBlock])).toBe(true);
    expect(isMessagingChannelRun("messaging", [{ kind: "text", text: "hi" }])).toBe(false);
    expect(isMessagingChannelRun("user", [channelBlock])).toBe(false);
    expect(isMessagingChannelRun("messaging", undefined)).toBe(false);
  });
});

describe("messagingRunContext", () => {
  it("names the bot reply tag only in runs another bot started", () => {
    const tagged = messagingRunContext({
      trigger: "bot_message",
      channelRun: false,
      botReplyTag: "[NOTIFY]",
    });
    expect(tagged.startsWith(messagingDmSurfaceNote())).toBe(true);
    expect(tagged).toContain("[NOTIFY]");

    for (const trigger of ["messaging", "user", "routine"]) {
      expect(messagingRunContext({ trigger, channelRun: false, botReplyTag: "[NOTIFY]" })).toBe(
        messagingDmSurfaceNote(),
      );
    }
    expect(messagingRunContext({ trigger: "bot_message", channelRun: false })).toBe(
      messagingDmSurfaceNote(),
    );
  });

  it("adds the group privacy rules to channel runs", () => {
    expect(messagingRunContext({ trigger: "messaging", channelRun: true })).toBe(
      `${messagingDmSurfaceNote()}\n\n${messagingChannelPrivacyBlock()}`,
    );
  });
});
