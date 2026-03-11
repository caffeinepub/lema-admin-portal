import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-card p-8 space-y-7">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-sidebar mx-auto">
              <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Lema Admin Portal
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Secure access for administrators only
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Features */}
          <div className="space-y-2.5">
            {[
              "Payment tracking & commission management",
              "Partner approval & store management",
              "Order tracking & customer service",
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {feat}
              </div>
            ))}
          </div>

          {/* Login button */}
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-semibold h-11"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Access is restricted to authorized administrators.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
