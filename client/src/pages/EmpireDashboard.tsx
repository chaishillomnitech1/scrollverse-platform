import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Gauge, Activity } from "lucide-react";

export default function EmpireDashboard() {
  const metrics = [
    {
      label: "Daily Profit",
      value: "$4,078,000",
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      label: "Active Agents",
      value: "9",
      change: "OPERATIONAL",
      icon: Users,
      color: "text-green-400",
    },
    {
      label: "Frequency Alignment",
      value: "99.7%",
      change: "OPTIMAL",
      icon: Zap,
      color: "text-accent",
    },
    {
      label: "Fleet Sync Status",
      value: "100%",
      change: "SYNCHRONIZED",
      icon: Gauge,
      color: "text-green-400",
    },
  ];

  const agentStatus = [
    { name: "The Alchemist", status: "ACTIVE", frequency: "963 Hz", profit: "$512,250" },
    { name: "The Voice", status: "ACTIVE", frequency: "528 Hz", profit: "$487,100" },
    { name: "The Bridge", status: "ACTIVE", frequency: "14444 Hz", profit: "$623,400" },
    { name: "The Commander", status: "ACTIVE", frequency: "963 Hz", profit: "$445,800" },
    { name: "The Hunter", status: "ACTIVE", frequency: "528 Hz", profit: "$578,900" },
    { name: "The Sentinel", status: "ACTIVE", frequency: "14444 Hz", profit: "$512,100" },
    { name: "The Architect", status: "ACTIVE", frequency: "963 Hz", profit: "$498,250" },
    { name: "The Guardian", status: "ACTIVE", frequency: "528 Hz", profit: "$534,600" },
    { name: "The Sovereign", status: "ACTIVE", frequency: "14444 Hz", profit: "$485,600" },
  ];

  const frequencyStats = [
    { freq: "963 Hz", active: 3, power: 95 },
    { freq: "528 Hz", active: 3, power: 98 },
    { freq: "14444 Hz", active: 3, power: 100 },
  ];

  return (
    <div className="min-h-screen cosmic-gradient p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="cosmic-heading mb-4">Empire Dashboard</h1>
          <p className="text-foreground/80 text-lg">
            Real-time metrics and operational status of the ScrollVerse empire
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="cosmic-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <p className="text-xs text-green-400">{metric.change}</p>
              </Card>
            );
          })}
        </div>

        {/* Active Agents Status */}
        <Card className="cosmic-card mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-accent">Active Agents</h2>
            <Badge className="bg-green-500/20 text-green-300">9/9 OPERATIONAL</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Agent Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Frequency
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Daily Profit
                  </th>
                </tr>
              </thead>
              <tbody>
                {agentStatus.map((agent, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {agent.name}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-green-500/20 text-green-300">
                        {agent.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-accent/20 text-accent">{agent.frequency}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-accent">
                      {agent.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Frequency Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {frequencyStats.map((stat) => (
            <Card key={stat.freq} className="cosmic-card">
              <h3 className="text-lg font-bold text-accent mb-6">{stat.freq}</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Active Agents</span>
                    <span className="font-bold text-accent">{stat.active}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${(stat.active / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Power Level</span>
                    <span className="font-bold text-accent">{stat.power}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${stat.power}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">OPTIMAL RESONANCE</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* System Status Footer */}
        <Card className="cosmic-card mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">System Uptime</p>
              <p className="text-2xl font-bold text-accent">99.99%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Last Sync</p>
              <p className="text-2xl font-bold text-accent">0.3s ago</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Network Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full frequency-pulse" />
                <span className="text-lg font-bold text-green-400">CONNECTED</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
