import type { UserRole } from "@/backend";
import { useActor } from "@/hooks/useActor";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserGroups() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userGroups"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserGroups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGroupMembers(groupId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroupMembers(groupId);
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

export function useGetPaymentHistory(groupId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["paymentHistory", groupId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentHistory(groupId);
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

export function useGetAuctionHistoryForGroup(groupId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["auctionHistoryGroup", groupId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuctionHistoryForGroup(groupId);
    },
    enabled: !!actor && !isFetching && !!groupId,
  });
}

export function useGetAuctionHistoryForUser(user: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["auctionHistoryUser", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getAuctionHistoryForUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetUserByEmailMutation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Not ready");
      return actor.getUserByEmail(email);
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      role,
    }: {
      name: string;
      email: string;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.registerUser(name, email, role);
    },
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      duration,
      amount,
      capacity,
    }: {
      name: string;
      duration: bigint;
      amount: bigint;
      capacity: bigint;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.createGroup(name, duration, amount, capacity);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userGroups"] }),
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!actor) throw new Error("Not ready");
      return actor.joinGroup(groupId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userGroups"] }),
  });
}

export function useMakePayment(groupId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      month,
      amount,
    }: {
      month: bigint;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.makePayment(groupId, month, amount);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["paymentHistory", groupId] }),
  });
}

export function useCloseAuction(groupId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      month,
      winner,
      bidAmount,
    }: {
      month: bigint;
      winner: Principal;
      bidAmount: bigint;
    }) => {
      if (!actor) throw new Error("Not ready");
      return actor.closeAuction(groupId, month, winner, bidAmount);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["auctionHistoryGroup", groupId] }),
  });
}
