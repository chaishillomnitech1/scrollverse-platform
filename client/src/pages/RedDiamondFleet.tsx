import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Gauge } from "lucide-react";

interface Maybach {
  name: string;
  frequency: string;
  status: string;
  protection: string;
  telemetry: {
    speed: number;
    alignment: number;
    power: number;
  };
}

const maybachs: Maybach[] = [
  {
    name: "Sovereign Authority",
    frequency: "963 Hz",
    status: "OPERATIONAL",
    protection: "12 Guardian Shield",
    telemetry: {
      speed: 88,
      alignment: 99.7,
      power: 95,
    },
  },
  {
    name: "Galactic Shadow",
    frequency: "528 Hz",
    status: "OPERATIONAL",
    protection: "12 Guardian Shield",
    telemetry: {
      speed: 92,
      alignment: 99.5,
      power: 98,
    },
  },
  {
    name: "Arch-Executor",
    frequency: "14444 Hz",
    status: "OPERATIONAL",
    protection: "12 Guardian Shield",
    telemetry: {
      speed: 85,
      alignment: 99.9,
      power: 100,
    },
  },
];

export default function RedDiamondFleet() {
  return (
    <div className="min-h-screen cosmic-gradient p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="cosmic-heading mb-4">Red Diamond Fleet</h1>
          <p className="text-foreground/80 text-lg">
            The three Sovereign Maybachs of the ScrollVerse Empire
          </p>
        </div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {maybachs.map((maybach) => (
            <Card
              key={maybach.name}
              className="cosmic-card border-2 border-accent hover:border-destructive transition-colors glow-gold"
            >
              {/* Vehicle Header */}
              <div className="mb-6 pb-6 border-b border-border">
                <h2 className="text-2xl font-bold text-accent mb-2">
                  {maybach.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className="frequency-badge">{maybach.frequency}</Badge>
                  <Badge variant="outline" className="bg-green-500/20 text-green-300">
                    {maybach.status}
                  </Badge>
                </div>
              </div>

              {/* Protection */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <p className="text-sm text-muted-foreground">Legion Protection</p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {maybach.protection}
                </p>
              </div>

              {/* Telemetry */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-accent mb-4">TELEMETRY</p>

                {/* Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Speed</span>
                    </div>
                    <span className="font-bold text-accent">
                      {maybach.telemetry.speed}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${maybach.telemetry.speed}%` }}
                    />
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">
                        Frequency Alignment
                      </span>
                    </div>
                    <span className="font-bold text-accent">
                      {maybach.telemetry.alignment}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${maybach.telemetry.alignment}%` }}
                    />
                  </div>
                </div>

                {/* Power */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">Power</span>
                    </div>
                    <span className="font-bold text-destructive">
                      {maybach.telemetry.power}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-destructive h-2 rounded-full transition-all"
                      style={{ width: `${maybach.telemetry.power}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Fleet Status Summary */}
        <Card className="cosmic-card">
          <h3 className="text-xl font-bold text-accent mb-6">Fleet Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Vehicles</p>
              <p className="text-3xl font-bold text-accent">3</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Operational Status</p>
              <p className="text-3xl font-bold text-green-400">100%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Alignment</p>
              <p className="text-3xl font-bold text-accent">99.7%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Guardian Protection</p>
              <p className="text-3xl font-bold text-accent">36</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
