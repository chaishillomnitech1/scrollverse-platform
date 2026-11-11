import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import type { Agent25SiteId } from "@shared/agent25";

type Props = { embedded?: boolean; siteId?: Agent25SiteId };

function detectSiteId(): Agent25SiteId {
  if (typeof window === "undefined") return "generic";
  const host = window.location.hostname.toLowerCase();
  if (host.includes("scrollatlas")) return "scrollatlas";
  if (host.includes("scrollport") || host.includes("omnitech")) return "omnitech1";
  if (host.includes("scrollverse")) return "scrollverse";
  return "generic";
}

export default function Agent25VisitorChat({ embedded = false, siteId }: Props) {
  const [open, setOpen] = useState(embedded);
  const [messages, setMessages] = useState<Message[]>([]);
  const chat = trpc.agent25.chat.useMutation({
    onSuccess: (result) => {
      setMessages((current) => [...current, {
        role: "assistant" as const,
        content: result.reply + "\n\n— Agent " + result.agentId + " · " + result.agentName,
      }].slice(-12));
    },
    onError: () => {
      setMessages((current) => [...current, {
        role: "assistant" as const,
        content: "Agent 25 is not configured or is temporarily unavailable. Please try again later.",
      }].slice(-12));
    },
  });

  const send = (content: string) => {
    const next: Message[] = [...messages, { role: "user" as const, content }].slice(-10);
    setMessages(next);
    chat.mutate({
      siteId: siteId ?? detectSiteId(),
      messages: next.map((message) => ({
        role: message.role === "assistant" ? "assistant" as const : "user" as const,
        content: message.content,
      })),
    });
  };

  if (typeof window !== "undefined" && window.location.pathname === "/agent25/embed" && !embedded) {
    return null;
  }

  if (embedded) {
    return (
      <div className="h-dvh w-full bg-background p-2">
        <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
          <div>
            <p className="font-semibold text-foreground">GOD MODE · AGENT 25 OMNI</p>
            <p className="text-xs text-muted-foreground">Public visitor assistant · Read-only</p>
          </div>
          <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">Pilot</span>
        </div>
        <AIChatBox
          messages={messages}
          onSendMessage={send}
          isLoading={chat.isPending}
          height="calc(100dvh - 64px)"
          placeholder="Ask about the ScrollVerse ecosystem..."
          emptyStateMessage="Welcome. Ask me about ScrollVerse, Omnitech1, ScrollAtlas, or public artifacts."
          suggestedPrompts={["What is ScrollAtlas?", "Explore the ScrollVerse", "How does Agent 25 work?"]}
        />
      </div>
    );
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[100] w-[min(92vw,400px)] rounded-xl border border-border bg-background p-2 shadow-2xl">
          <AIChatBox
            messages={messages}
            onSendMessage={send}
            isLoading={chat.isPending}
            height="min(70vh,560px)"
            placeholder="Ask the ScrollVerse..."
            emptyStateMessage="Welcome to the ScrollVerse. How can I help you explore?"
            suggestedPrompts={["Explore ScrollAtlas", "What is the AI Legion?", "Find public artifacts"]}
          />
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Close Agent 25 chat" : "Open Agent 25 chat"}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[101] flex items-center gap-2 rounded-full border border-emerald-300/40 bg-slate-950 px-5 py-3 font-semibold text-white shadow-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span>{open ? "Close" : "Ask Agent 25"}</span>
      </button>
    </>
  );
}
