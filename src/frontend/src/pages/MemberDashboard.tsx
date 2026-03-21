import type { ChitGroup } from "@/backend";
import DChitLogo from "@/components/DChitLogo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "@/contexts/UserContext";
import {
  useGetAuctionHistoryForGroup,
  useGetAuctionHistoryForUser,
  useGetPaymentHistory,
  useGetUserGroups,
  useJoinGroup,
  useMakePayment,
} from "@/hooks/useQueries";
import {
  Copy,
  CreditCard,
  Gavel,
  Loader2,
  LogOut,
  PlusCircle,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatAmount(amt: bigint) {
  return `₹${Number(amt).toLocaleString("en-IN")}`;
}

function formatDate(time: bigint) {
  return new Date(Number(time / 1000000n)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function GroupPaymentRow({ group }: { group: ChitGroup }) {
  const { data: payments, isLoading } = useGetPaymentHistory(group.id);
  const makePayment = useMakePayment(group.id);
  const duration = Number(group.duration);
  const months = Array.from({ length: duration }, (_, i) => i + 1);

  const paidMonths = new Set((payments ?? []).map((p) => Number(p.month)));

  const handlePay = async (month: number) => {
    try {
      await makePayment.mutateAsync({
        month: BigInt(month),
        amount: group.amount,
      });
      toast.success(`Payment for Month ${month} recorded!`);
    } catch (err: any) {
      toast.error(err?.message ?? "Payment failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {["a", "b", "c"].map((k) => (
          <Skeleton key={k} className="h-7 w-20" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Payment Status
      </p>
      <div className="flex flex-wrap gap-2">
        {months.map((m) => (
          <div key={`month-${group.id}-${m}`}>
            {paidMonths.has(m) ? (
              <Badge
                className="bg-brand-green-light text-primary border border-primary/30 font-medium"
                data-ocid="payment.item"
              >
                Month {m} ✓
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={() => handlePay(m)}
                disabled={makePayment.isPending}
                data-ocid="payment.button"
              >
                {makePayment.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                Month {m} — Pay
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupAuctionRow({ group }: { group: ChitGroup }) {
  const { data: auctions, isLoading } = useGetAuctionHistoryForGroup(group.id);

  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (!auctions || auctions.length === 0) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="auction.empty_state"
      >
        No auctions have been closed yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {auctions.map((a, idx) => (
        <div
          key={`auction-${group.id}-${Number(a.month)}-${idx}`}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
          data-ocid={`auction.item.${idx + 1}`}
        >
          <div>
            <p className="text-sm font-medium">
              Month {Number(a.month)} Auction
            </p>
            <p className="text-xs text-muted-foreground">
              Closed {formatDate(a.closedAt)}
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-brand-gold-light text-amber-700 border border-amber-200 font-semibold">
              {formatAmount(a.bidAmount)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MemberDashboard() {
  const { user, logout } = useUserContext();
  const { data: groups, isLoading: groupsLoading } = useGetUserGroups();
  const { data: myAuctions } = useGetAuctionHistoryForUser(user?.principal);
  const joinGroup = useJoinGroup();
  const [joinGroupId, setJoinGroupId] = useState("");

  const handleJoinGroup = async () => {
    if (!joinGroupId.trim()) {
      toast.error("Please enter a Group ID");
      return;
    }
    try {
      await joinGroup.mutateAsync(joinGroupId.trim());
      toast.success("Successfully joined the group!");
      setJoinGroupId("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to join group");
    }
  };

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("ID copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="bg-navy shadow-elevated sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <DChitLogo variant="light" size="md" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-white font-semibold text-sm">
                {user?.name}
              </span>
              <span className="text-brand-gold text-xs font-mono">
                {user?.id}
              </span>
            </div>
            <Badge className="bg-brand-green text-white border-0 hidden sm:flex">
              Member
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={logout}
              data-ocid="nav.button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
        {/* Profile Card */}
        <Card className="mb-8 border border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-white font-black text-2xl">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {user?.name}
                </h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-brand-gold font-bold text-base bg-brand-gold-light px-2 py-0.5 rounded">
                    {user?.id}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={copyId}
                    data-ocid="profile.button"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Badge className="bg-brand-green text-white border-0">
                    Member
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Groups */}
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  My Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupsLoading ? (
                  <div className="space-y-3" data-ocid="groups.loading_state">
                    {["sk1", "sk2", "sk3"].map((k) => (
                      <Skeleton key={k} className="h-14 w-full" />
                    ))}
                  </div>
                ) : !groups || groups.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="groups.empty_state"
                  >
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>You haven&apos;t joined any groups yet.</p>
                    <p className="text-sm">Use the Join Group section below.</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {groups.map((group, i) => (
                      <AccordionItem
                        key={group.id}
                        value={group.id}
                        className="border border-border rounded-lg px-4"
                        data-ocid={`groups.item.${i + 1}`}
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {group.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatAmount(group.amount)} ×{" "}
                                {Number(group.duration)} months •{" "}
                                {Number(group.capacity)} members
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                  Amount
                                </p>
                                <p className="font-bold text-primary text-sm">
                                  {formatAmount(group.amount)}
                                </p>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                  Duration
                                </p>
                                <p className="font-bold text-foreground text-sm">
                                  {Number(group.duration)} months
                                </p>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                  Group ID
                                </p>
                                <p className="font-bold text-brand-gold text-sm font-mono">
                                  {group.id}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <GroupPaymentRow group={group} />
                            <Separator />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Auction History
                              </p>
                              <GroupAuctionRow group={group} />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* My Auction Wins */}
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gavel className="w-5 h-5 text-primary" />
                  My Auction Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!myAuctions || myAuctions.length === 0 ? (
                  <div
                    className="text-center py-6 text-muted-foreground"
                    data-ocid="myauctions.empty_state"
                  >
                    <Gavel className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No auction wins yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myAuctions.map((a, idx) => (
                      <div
                        key={`myauction-${a.groupId}-${Number(a.month)}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                        data-ocid={`myauctions.item.${idx + 1}`}
                      >
                        <div>
                          <p className="font-semibold text-sm">
                            Group {a.groupId} — Month {Number(a.month)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(a.closedAt)}
                          </p>
                        </div>
                        <Badge className="bg-brand-gold-light text-amber-700 border border-amber-200 font-bold">
                          🏆 {formatAmount(a.bidAmount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Group */}
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PlusCircle className="w-4 h-4 text-primary" />
                  Join a Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Ask your organiser for the Group ID and enter it below.
                </p>
                <Input
                  placeholder="e.g. G0001"
                  value={joinGroupId}
                  onChange={(e) => setJoinGroupId(e.target.value)}
                  className="font-mono"
                  data-ocid="joingroup.input"
                />
                <Button
                  className="w-full"
                  onClick={handleJoinGroup}
                  disabled={joinGroup.isPending}
                  data-ocid="joingroup.primary_button"
                >
                  {joinGroup.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Join Group
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Groups Joined
                  </span>
                  <span className="font-bold text-foreground">
                    {groups?.length ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Total Value
                  </span>
                  <span className="font-bold text-primary">
                    {groups
                      ? formatAmount(groups.reduce((s, g) => s + g.amount, 0n))
                      : "₹0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Gavel className="w-4 h-4" /> Auction Wins
                  </span>
                  <span className="font-bold text-foreground">
                    {myAuctions?.length ?? 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
