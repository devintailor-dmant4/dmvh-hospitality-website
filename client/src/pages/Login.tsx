import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, EyeOff, Mail, Lock, ChevronDown } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleEmailAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/email-access", { email, name: name || undefined });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/portal");
    } catch (err: any) {
      toast({ title: "Access failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", { email, password });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/portal");
    } catch (err: any) {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-login-title">Client Portal Access</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter your email to access your portal — no password needed</p>
        </div>

        <Card className="p-6">
          <form onSubmit={showPasswordLogin ? handlePasswordLogin : handleEmailAccess} className="space-y-4" data-testid="form-login">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>

            {!showPasswordLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Your name <span className="text-muted-foreground font-normal text-xs">(optional — for new accounts)</span></Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="First and last name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
            )}

            {showPasswordLogin && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password">
                    <span className="text-xs text-primary hover:underline cursor-pointer" data-testid="link-forgot-password">Forgot?</span>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-login-submit">
              {loading ? "Accessing…" : showPasswordLogin ? "Sign In" : "Access My Portal"}
            </Button>

            <button
              type="button"
              onClick={() => setShowPasswordLogin(s => !s)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              data-testid="button-toggle-password-mode"
            >
              <Lock className="w-3.5 h-3.5" />
              {showPasswordLogin ? "Back to quick email access" : "Have a password? Sign in with it"}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPasswordLogin ? "rotate-180" : ""}`} />
            </button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Want to submit a quote?{" "}
          <Link href="/contact">
            <span className="text-primary font-medium hover:underline cursor-pointer" data-testid="link-contact">Request a Quote</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
