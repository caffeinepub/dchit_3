import { UserRole } from "@/backend";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider, useUserContext } from "@/contexts/UserContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetCallerProfile } from "@/hooks/useQueries";
import LandingPage from "@/pages/LandingPage";
import MemberDashboard from "@/pages/MemberDashboard";
import OrganiserDashboard from "@/pages/OrganiserDashboard";
import { useEffect } from "react";

function AppContent() {
  const { user, setUser, logout } = useUserContext();
  const { isFetching: actorLoading } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: callerProfile } = useGetCallerProfile();

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  // Auto-populate user from backend profile once actor is ready
  useEffect(() => {
    if (!user && callerProfile) {
      setUser(callerProfile);
    }
  }, [callerProfile, user, setUser]);

  // If a stored session exists but II has expired, clear it so user can re-authenticate
  useEffect(() => {
    if (user && !actorLoading && !isInitializing && isAnonymous) {
      logout();
    }
  }, [user, actorLoading, isInitializing, isAnonymous, logout]);

  if (!user) {
    return <LandingPage />;
  }

  if (user.role === UserRole.member) {
    return <MemberDashboard />;
  }

  return <OrganiserDashboard />;
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
      <Toaster richColors position="top-right" />
    </UserProvider>
  );
}
