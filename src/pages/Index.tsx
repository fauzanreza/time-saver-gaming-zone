
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleModeSelection = (mode: 'admin' | 'customer') => {
    localStorage.setItem("userMode", mode);
    
    if (mode === 'admin') {
      // Admin needs to log in
      navigate("/");
    } else {
      // Customer goes directly to dashboard in customer mode
      localStorage.setItem("isCustomer", "true");
      navigate("/customer-dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="container max-w-5xl px-4 py-12 relative">
        {/* Background blobs for depth */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
        
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Next-Gen Netcafe Management
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic">
            TIME <span className="text-primary neon-glow-text">MACHINES</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Experience the ultimate gaming management system. Secure, fast, and professional.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="gaming-card border-primary/20 hover:border-primary/50 group" 
                onClick={() => handleModeSelection('admin')}>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight uppercase italic">Staff Access</CardTitle>
              <CardDescription className="text-sm font-medium">
                Complete system oversight and controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Real-time device monitoring
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Revenue and sessions reports
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  System-wide configurations
                </div>
              </div>
              <Button className="w-full font-bold uppercase tracking-widest text-xs py-6 bg-primary hover:bg-primary/90 neon-glow-primary">
                AUTHENTICATE STAFF
              </Button>
            </CardContent>
          </Card>

          <Card className="gaming-card border-secondary/20 hover:border-secondary/50 group"
                onClick={() => handleModeSelection('customer')}>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight uppercase italic">Player Lobby</CardTitle>
              <CardDescription className="text-sm font-medium">
                Browse, book, and play immediately
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Live device availability check
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Quick duration booking
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  No login required for players
                </div>
              </div>
              <Button className="w-full font-bold uppercase tracking-widest text-xs py-6 bg-secondary hover:bg-secondary/90 neon-glow-secondary">
                START PLAYING
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
