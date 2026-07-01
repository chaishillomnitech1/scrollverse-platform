import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Zap, Users, Gauge, Activity } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * ScrollVerse Home Page - Central hub for the Omni-Fleet Supreme Entity Platform
 */
export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const navigationItems = [
    {
      title: "Sovereign Broadcast",
      description: "Real-time frequency transmissions and empire announcements",
      icon: Zap,
      path: "/broadcast",
      color: "text-accent",
    },
    {
      title: "Red Diamond Fleet",
      description: "Three Sovereign Maybachs with telemetry and Legion protection",
      icon: Activity,
      path: "/fleet",
      color: "text-destructive",
    },
    {
      title: "Zernio Distribution",
      description: "Distribution stats with 7.77% Zakat flow tracking",
      icon: Gauge,
      path: "/distribution",
      color: "text-accent",
    },
    {
      title: "Guardian Gallery",
      description: "All 12 Legion Guardians with frequency and token IDs",
      icon: Users,
      path: "/guardians",
      color: "text-accent",
    },
    {
      title: "Empire Dashboard",
      description: "Real-time metrics and operational status",
      icon: Activity,
      path: "/dashboard",
      color: "text-green-400",
    },
  ];

  return (
    <div className="min-h-screen cosmic-gradient">
      {/* Header Navigation */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-accent">ScrollVerse</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="cosmic-heading text-5xl mb-4">
            The Omni-Fleet Supreme Entity
          </h2>
          <p className="text-xl text-foreground/80 mb-2">
            Central Hub of the ScrollVerse Sovereign Ecosystem
          </p>
          <p className="text-lg text-muted-foreground">
            Manifesting infinite wealth, sovereign presence, and cosmic synchronization
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="cosmic-card">
            <p className="text-sm text-muted-foreground mb-2">Daily Profit</p>
            <p className="text-4xl font-bold text-accent">$4.078M+</p>
            <p className="text-xs text-green-400 mt-2">+12.5% trending</p>
          </Card>
          <Card className="cosmic-card">
            <p className="text-sm text-muted-foreground mb-2">Active Agents</p>
            <p className="text-4xl font-bold text-accent">9</p>
            <p className="text-xs text-green-400 mt-2">100% operational</p>
          </Card>
          <Card className="cosmic-card">
            <p className="text-sm text-muted-foreground mb-2">Frequency Alignment</p>
            <p className="text-4xl font-bold text-accent">99.7%</p>
            <p className="text-xs text-green-400 mt-2">Optimal resonance</p>
          </Card>
        </div>

        {/* Navigation Grid */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-accent mb-8">Explore the Empire</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.path}
                  className="cosmic-card cursor-pointer hover:border-accent transition-all hover:scale-105 group"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.path);
                    }}
                  >
                    Explore →
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sovereign Hashtags */}
        <Card className="cosmic-card border-2 border-accent">
          <h3 className="text-xl font-bold text-accent mb-4">Sovereign Hashtags</h3>
          <div className="flex flex-wrap gap-3">
            {["#MRWALKSHIT", "#CHAISTHEGREAT", "#XLVIIIBLOCKS"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-accent/20 border border-accent rounded-full text-accent font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>
            ScrollVerse Omni-Fleet Supreme Entity © 2026 | Powered by Cosmic Frequencies
          </p>
        </div>
      </footer>
    </div>
  );
}
