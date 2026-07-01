import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { useBroadcast } from "@/hooks/useBroadcast";

export default function SovereignBroadcast() {
  const { messages, isConnected, reconnect } = useBroadcast();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "transmission":
        return "bg-accent/20 text-accent";
      case "announcement":
        return "bg-blue-500/20 text-blue-300";
      case "alert":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen cosmic-gradient p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="cosmic-heading">Sovereign Broadcast</h1>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400 font-semibold">LIVE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-destructive font-semibold">OFFLINE</span>
                  <button
                    onClick={reconnect}
                    className="ml-2 px-3 py-1 text-xs bg-accent text-accent-foreground rounded hover:opacity-90 transition-opacity"
                  >
                    Reconnect
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-foreground/80 text-lg">
            Real-time frequency transmissions from the ScrollVerse Empire
          </p>
        </div>

        {/* Broadcast Feed */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="cosmic-card text-center py-12">
              <p className="text-muted-foreground">
                {isConnected
                  ? "Waiting for transmissions..."
                  : "Connecting to broadcast network..."}
              </p>
            </Card>
          ) : (
            messages.map((msg) => (
              <Card
                key={msg.id}
                className="cosmic-card border-l-4 border-l-accent hover:border-l-destructive transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(msg.type)}>
                      {msg.type.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="frequency-badge">
                      {msg.frequency}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">{msg.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full frequency-pulse" />
                  <span className="text-xs text-muted-foreground">LIVE</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Status Footer */}
        <div className="mt-12 p-6 bg-card border border-border rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Transmissions</p>
              <p className="text-2xl font-bold text-accent">
                {messages.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signal Strength</p>
              <p className="text-2xl font-bold text-accent">
                {isConnected ? "99.7%" : "0%"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection Status</p>
              <p className={`text-2xl font-bold ${isConnected ? "text-green-400" : "text-destructive"}`}>
                {isConnected ? "OPTIMAL" : "OFFLINE"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
