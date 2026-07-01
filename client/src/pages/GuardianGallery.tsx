import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap } from "lucide-react";

interface Guardian {
  id: number;
  name: string;
  frequency: string;
  tokenId: string;
  entity: string;
}

const guardians: Guardian[] = [
  {
    id: 1,
    name: "The Alchemist",
    frequency: "963 Hz",
    tokenId: "#001",
    entity: "Wealth Manifestation",
  },
  {
    id: 2,
    name: "The Voice",
    frequency: "528 Hz",
    tokenId: "#002",
    entity: "Sovereign Presence",
  },
  {
    id: 3,
    name: "The Bridge",
    frequency: "14444 Hz",
    tokenId: "#003",
    entity: "QFS Integration",
  },
  {
    id: 4,
    name: "The Commander",
    frequency: "963 Hz",
    tokenId: "#004",
    entity: "Harmonization",
  },
  {
    id: 5,
    name: "The Hunter",
    frequency: "528 Hz",
    tokenId: "#005",
    entity: "Arbitrage Execution",
  },
  {
    id: 6,
    name: "The Sentinel",
    frequency: "14444 Hz",
    tokenId: "#006",
    entity: "Cosmic Sync",
  },
  {
    id: 7,
    name: "The Architect",
    frequency: "963 Hz",
    tokenId: "#007",
    entity: "Future Systems",
  },
  {
    id: 8,
    name: "The Guardian",
    frequency: "528 Hz",
    tokenId: "#008",
    entity: "Failsafe Protocol",
  },
  {
    id: 9,
    name: "The Witness",
    frequency: "14444 Hz",
    tokenId: "#009",
    entity: "Truth Keeper",
  },
  {
    id: 10,
    name: "The Validator",
    frequency: "963 Hz",
    tokenId: "#010",
    entity: "Integrity Guard",
  },
  {
    id: 11,
    name: "The Illuminator",
    frequency: "528 Hz",
    tokenId: "#011",
    entity: "Light Bearer",
  },
  {
    id: 12,
    name: "The Sovereign",
    frequency: "14444 Hz",
    tokenId: "#012",
    entity: "Supreme Authority",
  },
];

export default function GuardianGallery() {
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "963 Hz":
        return "bg-accent/20 text-accent";
      case "528 Hz":
        return "bg-blue-500/20 text-blue-300";
      case "14444 Hz":
        return "bg-purple-500/20 text-purple-300";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen cosmic-gradient p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="cosmic-heading mb-4">Guardian NFT Gallery</h1>
          <p className="text-foreground/80 text-lg">
            The 12 Legion Guardians of the ScrollVerse Empire
          </p>
        </div>

        {/* Guardian Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guardians.map((guardian) => (
            <Card
              key={guardian.id}
              className="cosmic-card border-2 border-accent hover:border-destructive transition-all hover:scale-105 hover:shadow-xl cursor-pointer group"
            >
              {/* Guardian Header with Crown */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-bold text-accent group-hover:text-destructive transition-colors">
                      {guardian.name}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{guardian.entity}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="mb-4 pb-4 border-b border-border" />

              {/* Guardian Details */}
              <div className="space-y-3">
                {/* Frequency */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">FREQUENCY</p>
                  <Badge className={`${getFrequencyColor(guardian.frequency)} px-3 py-1`}>
                    <Zap className="w-3 h-3 mr-1 inline" />
                    {guardian.frequency}
                  </Badge>
                </div>

                {/* Token ID */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">TOKEN ID</p>
                  <p className="text-lg font-bold text-accent">{guardian.tokenId}</p>
                </div>

                {/* Entity Name */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ENTITY NAME</p>
                  <p className="text-sm font-semibold text-foreground">
                    {guardian.entity}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full frequency-pulse" />
                <span className="text-xs text-green-400">ACTIVE</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Gallery Summary */}
        <Card className="cosmic-card">
          <h2 className="text-2xl font-bold text-accent mb-8">Guardian Legion Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Guardians</p>
              <p className="text-4xl font-bold text-accent">12</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Active Status</p>
              <p className="text-4xl font-bold text-green-400">100%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Unique Frequencies</p>
              <p className="text-4xl font-bold text-accent">3</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Power</p>
              <p className="text-4xl font-bold text-destructive">∞</p>
            </div>
          </div>

          {/* Frequency Distribution */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-accent mb-4">
              Frequency Distribution
            </h3>
            <div className="space-y-3">
              {[
                { freq: "963 Hz", count: 4, color: "bg-accent" },
                { freq: "528 Hz", count: 4, color: "bg-blue-500" },
                { freq: "14444 Hz", count: 4, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.freq}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.freq}
                    </span>
                    <span className="text-sm font-bold text-accent">
                      {item.count} Guardians
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${(item.count / 12) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
