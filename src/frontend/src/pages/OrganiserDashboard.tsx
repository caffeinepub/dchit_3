import type { ChitGroup, UserProfile } from "@/backend";
import DChitLogo from "@/components/DChitLogo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserContext } from "@/contexts/UserContext";
import {
  useCloseAuction,
  useCreateGroup,
  useGetAuctionHistoryForGroup,
  useGetGroupMembers,
  useGetPaymentHistory,
  useGetUserByEmailMutation,
  useGetUserGroups,
  useMakePayment,
} from "@/hooks/useQueries";
import {
  ClipboardList,
  Copy,
  CreditCard,
  Gavel,
  Loader2,
  LogOut,
  PlusCircle,
  Search,
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

function CloseAuctionDialog({
  group,
  open,
  onClose,
}: {
  group: ChitGroup;
  open: boolean;
  onClose: () => void;
}) {
  const { data: members } = useGetGroupMembers(group.id);
  const closeAuction = useCloseAuction(group.id);
  const [month, setMonth] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  const handleClose = async () => {
    if (!month || !winnerId || !bidAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    const winner = members?.find((m) => m.id === winnerId);
    if (!winner) {
      toast.error("Winner not found");
      return;
    }
    try {
      await closeAuction.mutateAsync({
        month: BigInt(month),
        winner: winner.principal,
        bidAmount: BigInt(Math.round(Number(bidAmount))),
      });
      toast.success(
        `Auction for Month ${month} closed! Winner: ${winner.name}`,
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to close auction");
    }
  };

  const duration = Number(group.duration);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="auction.dialog">
        <DialogHeader>
          <DialogTitle>Close Auction — {group.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Month Number</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger data-ocid="auction.select">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: duration }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={`month-opt-${m}`} value={String(m)}>
                    Month {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Auction Winner</Label>
            <Select value={winnerId} onValueChange={setWinnerId}>
              <SelectTrigger data-ocid="auction.select">
                <SelectValue placeholder="Select winner" />
              </SelectTrigger>
              <SelectContent>
                {(members ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Final Bid Amount (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 45000"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              data-ocid="auction.input"
            />
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="auction.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={closeAuction.isPending}
            data-ocid="auction.confirm_button"
          >
            {closeAuction.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Close Auction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupPanel({ group }: { group: ChitGroup }) {
  const { data: members, isLoading: membersLoading } = useGetGroupMembers(
    group.id,
  );
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentHistory(
    group.id,
  );
  const { data: auctions, isLoading: auctionsLoading } =
    useGetAuctionHistoryForGroup(group.id);
  const makePayment = useMakePayment(group.id);
  const getUserByEmail = useGetUserByEmailMutation();

  const [auctionOpen, setAuctionOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [foundMember, setFoundMember] = useState<
    UserProfile | null | undefined
  >(undefined);

  const duration = Number(group.duration);
  const paidMonthsSet = new Set((payments ?? []).map((p) => Number(p.month)));

  const handleMarkPaid = async (month: number) => {
    try {
      await makePayment.mutateAsync({
        month: BigInt(month),
        amount: group.amount,
      });
      toast.success(`Month ${month} marked as paid`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to mark payment");
    }
  };

  const handleSearchMember = async () => {
    if (!searchEmail.trim()) {
      toast.error("Enter an email address");
      return;
    }
    const result = await getUserByEmail
      .mutateAsync(searchEmail.trim())
      .catch((e: any) => {
        toast.error(e?.message ?? "Search failed");
        return null;
      });
    setFoundMember(result);
  };

  const copyGroupId = () => {
    navigator.clipboard.writeText(group.id);
    toast.success("Group ID copied!");
  };

  return (
    <div className="pt-2">
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="details" data-ocid="grouppanel.tab">
            Details
          </TabsTrigger>
          <TabsTrigger value="members" data-ocid="grouppanel.tab">
            Members
          </TabsTrigger>
          <TabsTrigger value="payments" data-ocid="grouppanel.tab">
            Payments
          </TabsTrigger>
          <TabsTrigger value="auctions" data-ocid="grouppanel.tab">
            Auctions
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Group ID</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="font-bold text-brand-gold text-sm font-mono">
                  {group.id}
                </p>
                <button
                  type="button"
                  onClick={copyGroupId}
                  aria-label="Copy group ID"
                >
                  <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Chit Amount</p>
              <p className="font-bold text-primary text-sm">
                {formatAmount(group.amount)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-bold text-foreground text-sm">
                {Number(group.duration)} months
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Capacity</p>
              <p className="font-bold text-foreground text-sm">
                {Number(group.capacity)} members
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-accent border border-primary/20">
            <p className="text-xs text-accent-foreground font-medium mb-1">
              📋 Share this Group ID with members:
            </p>
            <div className="flex items-center gap-2">
              <code className="font-mono font-bold text-primary text-sm flex-1">
                {group.id}
              </code>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={copyGroupId}
                data-ocid="grouppanel.button"
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Members can join by entering this ID in their Member Dashboard.
            </p>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {membersLoading ? (
            <div className="space-y-2" data-ocid="members.loading_state">
              {["sk-a", "sk-b", "sk-c"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div>
              {!members || members.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground py-4 text-center"
                  data-ocid="members.empty_state"
                >
                  No members yet. Share the Group ID to invite members.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {members.map((m, idx) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card"
                      data-ocid={`members.item.${idx + 1}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
                        {m.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.email}
                        </p>
                      </div>
                      <span className="font-mono text-brand-gold text-xs font-bold">
                        {m.id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Find Member by Email
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="member@email.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
                className="flex-1"
                data-ocid="members.search_input"
              />
              <Button
                variant="outline"
                onClick={handleSearchMember}
                disabled={getUserByEmail.isPending}
                data-ocid="members.button"
              >
                {getUserByEmail.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {foundMember === null && (
              <p
                className="text-sm text-destructive mt-2"
                data-ocid="members.error_state"
              >
                No member found with that email.
              </p>
            )}
            {foundMember && (
              <div
                className="mt-3 p-3 rounded-lg bg-accent border border-primary/20"
                data-ocid="members.success_state"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm">
                    {foundMember.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{foundMember.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {foundMember.email}
                    </p>
                    <span className="font-mono text-brand-gold text-xs font-bold">
                      {foundMember.id}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share Group ID <strong>{group.id}</strong> with this member
                  for them to join.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-3">
          {paymentsLoading ? (
            <div className="space-y-2" data-ocid="payments.loading_state">
              {["sk-1", "sk-2", "sk-3", "sk-4"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: duration }, (_, i) => i + 1).map((m) => {
                const isPaid = paidMonthsSet.has(m);
                const payment = payments?.find((p) => Number(p.month) === m);
                return (
                  <div
                    key={`pay-${group.id}-${m}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    data-ocid={`payments.item.${m}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isPaid ? "bg-primary" : "bg-destructive"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">Month {m}</p>
                        {isPaid && payment && (
                          <p className="text-xs text-muted-foreground">
                            Paid on {formatDate(payment.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <Badge className="bg-brand-green-light text-primary border border-primary/30">
                          ✓ Paid
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-primary border-primary/40 hover:bg-accent"
                          onClick={() => handleMarkPaid(m)}
                          disabled={makePayment.isPending}
                          data-ocid="payments.button"
                        >
                          {makePayment.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : null}
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Auctions Tab */}
        <TabsContent value="auctions" className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setAuctionOpen(true)}
              data-ocid="auctions.open_modal_button"
            >
              <Gavel className="w-3.5 h-3.5 mr-1.5" />
              Close Auction
            </Button>
          </div>

          {auctionsLoading ? (
            <Skeleton
              className="h-24 w-full"
              data-ocid="auctions.loading_state"
            />
          ) : !auctions || auctions.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="auctions.empty_state"
            >
              <Gavel className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No auctions closed yet.</p>
              <p className="text-xs">
                Use the button above to close an auction.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {auctions.map((a, idx) => {
                const winner = members?.find(
                  (m) => m.principal.toString() === a.winner.toString(),
                );
                return (
                  <div
                    key={`auc-${group.id}-${Number(a.month)}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    data-ocid={`auctions.item.${idx + 1}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        Month {Number(a.month)} Auction
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Winner:{" "}
                        {winner ? `${winner.name} (${winner.id})` : "Unknown"} •{" "}
                        {formatDate(a.closedAt)}
                      </p>
                    </div>
                    <Badge className="bg-brand-gold-light text-amber-700 border border-amber-200 font-bold">
                      🏆 {formatAmount(a.bidAmount)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CloseAuctionDialog
        group={group}
        open={auctionOpen}
        onClose={() => setAuctionOpen(false)}
      />
    </div>
  );
}

function CreateGroupForm() {
  const createGroup = useCreateGroup();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [amount, setAmount] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration || !amount || !capacity) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const groupId = await createGroup.mutateAsync({
        name: name.trim(),
        duration: BigInt(duration),
        amount: BigInt(amount),
        capacity: BigInt(capacity),
      });
      toast.success(`Group created! ID: ${groupId}`);
      setName("");
      setDuration("");
      setAmount("");
      setCapacity("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create group");
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            placeholder="e.g. Sharma Family Chit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-ocid="creategroup.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="group-duration">Duration (months)</Label>
          <Input
            id="group-duration"
            type="number"
            min="1"
            max="60"
            placeholder="e.g. 12"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            data-ocid="creategroup.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="group-amount">Chit Amount (₹)</Label>
          <Input
            id="group-amount"
            type="number"
            min="1"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-ocid="creategroup.input"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="group-capacity">Total Members</Label>
          <Input
            id="group-capacity"
            type="number"
            min="2"
            max="100"
            placeholder="e.g. 10"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            data-ocid="creategroup.input"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={createGroup.isPending}
        data-ocid="creategroup.submit_button"
      >
        {createGroup.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <PlusCircle className="mr-2 h-4 w-4" />
        )}
        {createGroup.isPending ? "Creating..." : "Create Group"}
      </Button>
    </form>
  );
}

export default function OrganiserDashboard() {
  const { user, logout } = useUserContext();
  const { data: groups, isLoading: groupsLoading } = useGetUserGroups();

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("ID copied!");
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
            <Badge className="bg-brand-gold text-white border-0 hidden sm:flex">
              Organiser
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

      <main className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        {/* Profile Card */}
        <Card className="mb-8 border border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center text-white font-black text-2xl">
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
                  <Badge className="bg-brand-gold text-white border-0">
                    Organiser
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {groups?.length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Groups Created
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-primary">
                    {groups
                      ? formatAmount(groups.reduce((s, g) => s + g.amount, 0n))
                      : "₹0"}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Group */}
          <div>
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Create New Group
                </CardTitle>
                <CardDescription>
                  Set up a new chit fund group with custom parameters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateGroupForm />
              </CardContent>
            </Card>
          </div>

          {/* My Groups */}
          <div className="lg:col-span-2">
            <Card className="border border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  My Groups
                </CardTitle>
                <CardDescription>
                  Manage members, payments, and auctions for each group.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groupsLoading ? (
                  <div className="space-y-3" data-ocid="groups.loading_state">
                    {["sk-g1", "sk-g2", "sk-g3"].map((k) => (
                      <Skeleton key={k} className="h-14 w-full" />
                    ))}
                  </div>
                ) : !groups || groups.length === 0 ? (
                  <div
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="groups.empty_state"
                  >
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No groups yet.</p>
                    <p className="text-sm">
                      Use the form on the left to create your first group.
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {groups.map((group, i) => (
                      <AccordionItem
                        key={group.id}
                        value={group.id}
                        className="border border-border rounded-lg px-4"
                        data-ocid={`groups.item.${i + 1}`}
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3 text-left flex-1">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">
                                  {group.name}
                                </p>
                                <span className="font-mono text-brand-gold text-xs font-bold bg-brand-gold-light px-1.5 py-0.5 rounded">
                                  {group.id}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatAmount(group.amount)} ×{" "}
                                {Number(group.duration)} months •{" "}
                                {Number(group.capacity)} members capacity
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <GroupPanel group={group} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
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
