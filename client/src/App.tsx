import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SovereignBroadcast from "./pages/SovereignBroadcast";
import RedDiamondFleet from "./pages/RedDiamondFleet";
import ZernioDistribution from "./pages/ZernioDistribution";
import GuardianGallery from "./pages/GuardianGallery";
import EmpireDashboard from "./pages/EmpireDashboard";
import Agent25Embed from "./pages/Agent25Embed";
import Agent25VisitorChat from "./components/Agent25VisitorChat";

function Router() {
  return (
    <Switch>
      <Route path={"/agent25/embed"} component={Agent25Embed} />
      <Route path={"/"} component={Home} />
      <Route path={"/broadcast"} component={SovereignBroadcast} />
      <Route path={"/fleet"} component={RedDiamondFleet} />
      <Route path={"/distribution"} component={ZernioDistribution} />
      <Route path={"/guardians"} component={GuardianGallery} />
      <Route path={"/dashboard"} component={EmpireDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <Agent25VisitorChat />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
