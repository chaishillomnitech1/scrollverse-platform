export const AGENT25_AGENTS = [
  { id: "01", name: "Mission Discovery", pillar: "COMPLETE", keywords: ["unfinished", "missing", "discover", "backlog", "incomplete"] },
  { id: "02", name: "Strategic Planning", pillar: "COMPLETE", keywords: ["plan", "strategy", "roadmap", "prioritize", "scope"] },
  { id: "03", name: "Execution Coordination", pillar: "COMPLETE", keywords: ["execute", "workflow", "coordinate", "implementation", "build"] },
  { id: "04", name: "Progress Intelligence", pillar: "COMPLETE", keywords: ["progress", "status", "blocker", "milestone", "completion"] },
  { id: "05", name: "Conversation Recovery", pillar: "PRESERVE", keywords: ["conversation", "chat history", "chatgpt", "transcript", "title recovery"] },
  { id: "06", name: "Digital Archive", pillar: "PRESERVE", keywords: ["archive", "document", "book", "media", "artifact"] },
  { id: "07", name: "Provenance", pillar: "PRESERVE", keywords: ["provenance", "original", "source", "attribution", "checksum"] },
  { id: "08", name: "Knowledge Index", pillar: "PRESERVE", keywords: ["index", "search", "catalog", "knowledge base", "find"] },
  { id: "09", name: "Ecosystem Integration", pillar: "CONNECT", keywords: ["connect", "ecosystem", "scrollverse", "omnitech1", "integration"] },
  { id: "10", name: "GitHub Intelligence", pillar: "CONNECT", keywords: ["github", "repository", "repo", "commit", "branch", "code"] },
  { id: "11", name: "Platform Connectivity", pillar: "CONNECT", keywords: ["api", "platform", "connector", "endpoint", "authentication"] },
  { id: "12", name: "Universal Discovery", pillar: "CONNECT", keywords: ["scrollatlas", "site map", "universal discovery", "navigate", "portal"] },
  { id: "13", name: "Software Quality", pillar: "VERIFY", keywords: ["bug", "software", "code review", "dependency", "quality"] },
  { id: "14", name: "Website Quality", pillar: "VERIFY", keywords: ["website", "web page", "route", "navigation", "mobile", "accessibility"] },
  { id: "15", name: "Evidence Verification", pillar: "VERIFY", keywords: ["verify", "evidence", "proof", "claim", "confirmed", "status"] },
  { id: "16", name: "Integration Test", pillar: "VERIFY", keywords: ["test", "testing", "integration test", "api contract", "regression"] },
  { id: "17", name: "Creator Experience", pillar: "ACTIVATE", keywords: ["creator", "gallery", "museum", "showcase", "artwork"] },
  { id: "18", name: "Education", pillar: "ACTIVATE", keywords: ["learn", "lesson", "tutorial", "education", "guide"] },
  { id: "19", name: "Product Development", pillar: "ACTIVATE", keywords: ["product", "business", "revenue", "membership", "service"] },
  { id: "20", name: "Distribution", pillar: "ACTIVATE", keywords: ["publish", "distribution", "release", "share", "campaign"] },
  { id: "21", name: "Cybersecurity", pillar: "PROTECT", keywords: ["security", "vulnerability", "attack", "secret", "credential"] },
  { id: "22", name: "Intellectual Property", pillar: "PROTECT", keywords: ["intellectual property", "copyright", "license", "ownership", "trademark"] },
  { id: "23", name: "Privacy and Governance", pillar: "PROTECT", keywords: ["privacy", "personal data", "permission", "governance", "consent"] },
  { id: "24", name: "Infrastructure Resilience", pillar: "PROTECT", keywords: ["infrastructure", "backup", "recovery", "uptime", "resilience"] },
  { id: "25", name: "Omni Intelligence", pillar: "OMNI", keywords: ["omni", "overall", "empire", "big picture", "all choices"] },
] as const;

export type Agent25Definition = (typeof AGENT25_AGENTS)[number];
export type Agent25SiteId = "scrollverse" | "scrollatlas" | "omnitech1" | "generic";

export function selectAgent(message: string): Agent25Definition {
  const normalized = message.toLowerCase();
  let best: Agent25Definition = AGENT25_AGENTS[24];
  let bestScore = 0;
  for (const agent of AGENT25_AGENTS) {
    const score = agent.keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      best = agent;
      bestScore = score;
    }
  }
  return best;
}
