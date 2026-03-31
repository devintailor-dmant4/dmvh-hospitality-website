import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      // Always show success to prevent user enumeration
      setSent(true);
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
          <h1 className="text-2xl font-bold font-serif" data-testid="text-forgot-title">Forgot Password</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        <Card className="p-6">
          {sent ? (
            <div className="text-center py-4" data-testid="text-forgot-success">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Check your inbox</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your spam folder if you don't see it.
              </p>
              <p className="text-xs text-muted-foreground mt-4">The link expires in 1 hour.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-forgot-password">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-send-reset">
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center mt-5">
          <Link href="/login">
            <span className="text-sm text-primary hover:underline cursor-pointer flex items-center justify-center gap-1" data-testid="link-back-login">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
