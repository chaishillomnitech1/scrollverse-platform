import Agent25VisitorChat from "@/components/Agent25VisitorChat";
import type { Agent25SiteId } from "@shared/agent25";

const allowedSiteIds: Agent25SiteId[] = ["scrollverse", "scrollatlas", "omnitech1", "generic"];

export default function Agent25Embed() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("siteId") as Agent25SiteId | null;
  const siteId = requested && allowedSiteIds.includes(requested) ? requested : "generic";
  return <Agent25VisitorChat embedded siteId={siteId} />;
}
