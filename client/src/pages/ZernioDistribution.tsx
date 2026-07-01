import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ZernioDistribution() {
  // Fetch distribution stats from tRPC
  const { data: stats, isLoading: statsLoading } = trpc.distribution.getStats.useQuery();
  const { data: hashtags, isLoading: hashtagsLoading } = trpc.distribution.getHashtags.useQuery();
  const { data: zakatFlow, isLoading: zakatLoading } = trpc.distribution.getZakatFlow.useQuery();
  const { data: flowStages, isLoading: stagesLoading } = trpc.distribution.getFlowStages.useQuery();

  const isLoading = statsLoading || hashtagsLoading || zakatLoading || stagesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-gradient p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading distribution network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-gradient p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="cosmic-heading mb-4">Zernio Distribution</h1>
          <p className="text-foreground/80 text-lg">
            ScrollVerse sovereign distribution network
          </p>
        </div>

        {/* Sovereign Hashtags */}
        {hashtags && (
          <Card className="cosmic-card mb-12 border-2 border-accent">
            <h2 className="text-xl font-bold text-accent mb-6">Sovereign Hashtags</h2>
            <div className="flex flex-wrap gap-4">
              {hashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  className="px-4 py-2 text-base bg-accent/20 text-accent border border-accent hover:bg-accent/30 transition-colors"
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              These sovereign hashtags must appear exactly as written in all distribution communications.
            </p>
          </Card>
        )}

        {/* Zakat Flow */}
        {zakatFlow && (
          <Card className="cosmic-card mb-12 border-2 border-destructive">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-destructive">Zakat Flow</h2>
              <Zap className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center py-8">
              <p className="text-6xl font-bold text-destructive mb-2">
                {zakatFlow.percentage}%
              </p>
              <p className="text-lg text-muted-foreground">
                {zakatFlow.description}
              </p>
            </div>
            <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
              <p className="text-sm text-foreground">
                The Zakat flow represents the eternal distribution mechanism of the ScrollVerse,
                ensuring continuous and equitable capital flow across all Guardian entities.
              </p>
            </div>
          </Card>
        )}

        {/* Distribution Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="cosmic-card">
              <p className="text-sm text-muted-foreground mb-2">Total Distribution</p>
              <p className="text-3xl font-bold text-accent mb-2">{stats.totalAmount}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+12.5% trending</span>
              </div>
            </Card>
            <Card className="cosmic-card">
              <p className="text-sm text-muted-foreground mb-2">Active Wallets</p>
              <p className="text-3xl font-bold text-accent mb-2">{stats.activeWallets.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+8.3% growth</span>
              </div>
            </Card>
            <Card className="cosmic-card">
              <p className="text-sm text-muted-foreground mb-2">Zakat Flow</p>
              <p className="text-3xl font-bold text-accent mb-2">{stats.zakatPercentage}%</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/20 text-green-300">
                  CONSTANT
                </Badge>
              </div>
            </Card>
            <Card className="cosmic-card">
              <p className="text-sm text-muted-foreground mb-2">Distribution Cycles</p>
              <p className="text-3xl font-bold text-accent mb-2">{stats.distributionCycles}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+2 cycles</span>
              </div>
            </Card>
          </div>
        )}

        {/* Distribution Flow Visualization */}
        {flowStages && (
          <Card className="cosmic-card">
            <h2 className="text-xl font-bold text-accent mb-8">Distribution Flow</h2>
            <div className="space-y-6">
              {flowStages.map((flow, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{flow.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-bold">{flow.amount}</span>
                      <Badge variant="outline" className="bg-green-500/20 text-green-300">
                        {flow.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${100 - idx * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
