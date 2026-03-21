import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Auction {
    month: bigint;
    winner: Principal;
    bidAmount: bigint;
    closedAt: Time;
    groupId: string;
}
export interface ChitGroup {
    id: string;
    organiser: Principal;
    duration: bigint;
    name: string;
    createdAt: Time;
    capacity: bigint;
    amount: bigint;
}
export interface Payment {
    month: bigint;
    user: Principal;
    groupId: string;
    amount: bigint;
    paidAt: Time;
}
export interface UserProfile {
    id: string;
    principal: Principal;
    name: string;
    role: UserRole;
    email: string;
}
export enum UserRole {
    member = "member",
    organiser = "organiser"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    closeAuction(groupId: string, month: bigint, winner: Principal, bidAmount: bigint): Promise<void>;
    createGroup(name: string, duration: bigint, amount: bigint, capacity: bigint): Promise<string>;
    getAuctionHistoryForGroup(groupId: string): Promise<Array<Auction>>;
    getAuctionHistoryForUser(user: Principal): Promise<Array<Auction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getGroup(groupId: string): Promise<ChitGroup | null>;
    getGroupMembers(groupId: string): Promise<Array<UserProfile>>;
    getPaymentHistory(groupId: string): Promise<Array<Payment>>;
    getUserByEmail(email: string): Promise<UserProfile | null>;
    getUserGroups(): Promise<Array<ChitGroup>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfile_deprecated(): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinGroup(groupId: string): Promise<void>;
    makePayment(groupId: string, month: bigint, amount: bigint): Promise<void>;
    registerUser(name: string, email: string, role: UserRole): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
