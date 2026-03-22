import { UserRole } from "@/backend";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider, useUserContext } from "@/contexts/UserContext";
import { useGetCallerProfile } from "@/hooks/useQueries";
import LandingPage from "@/pages/LandingPage";
import MemberDashboard from "@/pages/MemberDashboard";
import OrganiserDashboard from "@/pages/OrganiserDashboard";
import { useEffect } from "react";

function AppContent() {
  const { user, setUser } = useUserContext();
  const { data: callerProfile } = useGetCallerProfile();

  useEffect(() => {
    if (!user && callerProfile) {
      setUser(callerProfile);
    }
  }, [callerProfile, user, setUser]);

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
