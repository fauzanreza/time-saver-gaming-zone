
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LockIcon, LogInIcon, AlertCircleIcon } from "lucide-react";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock admin credentials
  const adminUser = { username: "admin", password: "admin123" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simple validation
    if (!username || !password) {
      setError("Please enter both username and password.");
      setIsLoading(false);
      return;
    }

    // Mock authentication
    setTimeout(() => {
      if (username === adminUser.username && password === adminUser.password) {
        // Store auth state (in a real app, you'd use a proper auth system)
        localStorage.setItem("isAuthenticated", "true");
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError("Invalid username or password. Please try again.");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md gaming-card border-white/10">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-12 w-12 rounded bg-primary flex items-center justify-center neon-glow-primary mb-2">
            <span className="text-primary-foreground font-black italic text-xl">TM</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">ADMIN PORTAL</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Time Machines Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-destructive/30 text-destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button type="button" variant="link" className="px-0 text-xs text-accent">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full font-bold uppercase tracking-widest text-xs py-6 neon-glow-primary bg-primary hover:bg-primary/90"
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <LockIcon className="mr-2 h-4 w-4 animate-spin text-white" />
                SECURE AUTHENTICATING...
              </span>
            ) : (
              <span className="flex items-center">
                <LogInIcon className="mr-2 h-4 w-4" />
                ENTER SYSTEM
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
