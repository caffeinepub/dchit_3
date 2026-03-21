import { UserRole } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserContext } from "@/contexts/UserContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { AlertCircle, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DChitLogo from "./DChitLogo";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "register" | "login";
}

export default function AuthModal({
  open,
  onClose,
  defaultTab = "register",
}: AuthModalProps) {
  const {
    actor,
    isFetching: actorLoading,
    isError: actorError,
    refetch,
  } = useActor();
  const { setUser } = useUserContext();
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  // Actor is ready only when we have a non-anonymous authenticated actor with the actor loaded
  const actorReady = isAuthenticated && !actorLoading && !!actor;

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<UserRole>(UserRole.member);
  const [regLoading, setRegLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !actorReady) {
      toast.error(
        "Secure connection is still initializing, please wait a moment and try again",
      );
      return;
    }
    if (!regName.trim() || !regEmail.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setRegLoading(true);
    try {
      await actor.registerUser(regName.trim(), regEmail.trim(), regRole);
      const profile = await actor.getCallerUserProfile();
      if (profile) {
        setUser(profile);
        toast.success(`Welcome to DChit, ${profile.name}!`);
        onClose();
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !actorReady) {
      toast.error(
        "Secure connection is still initializing, please wait a moment and try again",
      );
      return;
    }
    if (!loginEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoginLoading(true);
    try {
      const profile = await actor.getUserByEmail(loginEmail.trim());
      if (profile) {
        setUser(profile);
        toast.success(`Welcome back, ${profile.name}!`);
        onClose();
      } else {
        toast.error("No account found with this email. Please register first.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="auth.dialog">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <DChitLogo size="md" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Welcome to DChit
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Secure Login Required
              </p>
              <p className="text-sm text-muted-foreground">
                DChit runs on blockchain. You need to sign in with{" "}
                <strong>Internet Identity</strong> first to securely access your
                account.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              data-ocid="auth.ii_button"
            >
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoggingIn
                ? "Opening Internet Identity..."
                : "Login with Internet Identity"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Internet Identity is a free, secure authentication system for ICP
              apps.
            </p>
          </div>
        ) : actorError && !actorLoading ? (
          // Connection failed -- show retry
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Connection Failed
              </p>
              <p className="text-sm text-muted-foreground">
                Could not connect to the blockchain. Please check your internet
                connection and try again.
              </p>
            </div>
            <Button className="w-full" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </div>
        ) : !actorReady ? (
          // Show a brief loading screen while the authenticated actor is being set up
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                Setting Up Secure Connection
              </p>
              <p className="text-sm text-muted-foreground">
                Please wait a moment while we connect to the blockchain...
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue={defaultTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register" data-ocid="auth.tab">
                Register
              </TabsTrigger>
              <TabsTrigger value="login" data-ocid="auth.tab">
                Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    placeholder="e.g. Priya Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email Address</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Your Role</Label>
                  <RadioGroup
                    value={regRole}
                    onValueChange={(v) => setRegRole(v as UserRole)}
                    className="grid grid-cols-2 gap-3"
                  >
                    <label
                      htmlFor="role-member"
                      className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${regRole === UserRole.member ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}
                    >
                      <RadioGroupItem
                        value={UserRole.member}
                        id="role-member"
                        className="sr-only"
                        data-ocid="auth.radio"
                      />
                      <span className="text-2xl mb-1">👤</span>
                      <span className="font-semibold text-sm">Chit Member</span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Join groups & bid
                      </span>
                    </label>
                    <label
                      htmlFor="role-organiser"
                      className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${regRole === UserRole.organiser ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}
                    >
                      <RadioGroupItem
                        value={UserRole.organiser}
                        id="role-organiser"
                        className="sr-only"
                        data-ocid="auth.radio"
                      />
                      <span className="text-2xl mb-1">🏢</span>
                      <span className="font-semibold text-sm">Organiser</span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Create & manage
                      </span>
                    </label>
                  </RadioGroup>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={regLoading}
                  data-ocid="auth.submit_button"
                >
                  {regLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {regLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    data-ocid="auth.input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginLoading}
                  data-ocid="auth.submit_button"
                >
                  {loginLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loginLoading ? "Signing In..." : "Sign In"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Don&apos;t have an account? Switch to Register tab.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
