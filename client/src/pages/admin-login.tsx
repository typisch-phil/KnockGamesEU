import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginError, isLoggingIn, isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already authenticated and admin
  if (isAuthenticated && isAdmin) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--dark-bg))] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-[hsl(var(--dark-secondary))] border-[hsl(var(--dark-tertiary))]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="text-[hsl(var(--brand-orange))] w-12 h-12" />
            </div>
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Access the KnockGames.eu admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-[hsl(var(--dark-tertiary))] border-[hsl(var(--dark-tertiary))] text-white focus:border-[hsl(var(--brand-orange))]"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[hsl(var(--dark-tertiary))] border-[hsl(var(--dark-tertiary))] text-white focus:border-[hsl(var(--brand-orange))]"
                  placeholder="Enter your password"
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/30 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{loginError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[hsl(var(--brand-orange))] hover:bg-[hsl(var(--brand-orange-dark))] text-white"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-blue-900/30 border border-blue-500/30 rounded-md">
              <p className="text-blue-400 text-sm">
                <strong>Demo Credentials:</strong><br />
                Username: admin<br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}