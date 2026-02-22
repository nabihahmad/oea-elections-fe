import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, isInitializing, error, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError("Please enter both username and password");
      return;
    }

    try {
      await login(username.trim(), password);
      navigate("/");
    } catch (err: any) {
      // error is set in context
    }
  };

  useEffect(() => {
    if (!isInitializing && user) {
      navigate("/");
    }
  }, [isInitializing, navigate, user]);

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo & title outside the card for a cleaner mobile feel */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src={logo} alt="Portal Logo" className="h-20 w-20 rounded-2xl shadow-lg" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary-foreground">Elections 2026</h1>
            <p className="text-sm text-primary-foreground/60">Sign in to continue</p>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                maxLength={100}
                autoComplete="username"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                maxLength={128}
                autoComplete="current-password"
                className="h-12 text-base"
              />
            </div>

            {displayError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
