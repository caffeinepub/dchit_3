import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Order "mo:core/Order";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserRole = { #member; #organiser };

  type UserProfile = {
    id : Text;
    name : Text;
    email : Text;
    role : UserRole;
    principal : Principal;
  };

  type ChitGroup = {
    id : Text;
    name : Text;
    duration : Nat;
    amount : Nat;
    capacity : Nat;
    organiser : Principal;
    createdAt : Time.Time;
  };

  type Membership = { groupId : Text; user : Principal; joinedAt : Time.Time };
  type Payment = { groupId : Text; user : Principal; month : Nat; amount : Nat; paidAt : Time.Time };
  type Auction = { groupId : Text; month : Nat; winner : Principal; bidAmount : Nat; closedAt : Time.Time };

  type MembershipKey = (Principal, Text);
  type PaymentKey = (Principal, Text, Nat);
  type AuctionKey = (Text, Nat);

  module MembershipKey {
    public func compare(m1 : MembershipKey, m2 : MembershipKey) : Order.Order {
      switch (Principal.compare(m1.0, m2.0)) {
        case (#equal) { Text.compare(m1.1, m2.1) };
        case (order) { order };
      };
    };
  };

  module PaymentKey {
    public func compare(p1 : PaymentKey, p2 : PaymentKey) : Order.Order {
      switch (Principal.compare(p1.0, p2.0)) {
        case (#equal) {
          switch (Text.compare(p1.1, p2.1)) {
            case (#equal) { Nat.compare(p1.2, p2.2) };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  module AuctionKey {
    public func compare(a1 : AuctionKey, a2 : AuctionKey) : Order.Order {
      switch (Text.compare(a1.0, a2.0)) {
        case (#equal) { Nat.compare(a1.1, a2.1) };
        case (order) { order };
      };
    };
  };

  let users = Map.empty<Principal, UserProfile>();
  let groups = Map.empty<Text, ChitGroup>();
  let memberships = Map.empty<MembershipKey, Membership>();
  let payments = Map.empty<PaymentKey, Payment>();
  let auctions = Map.empty<AuctionKey, Auction>();

  var userCounter = 0;
  var groupCounter = 0;

  func requireNotAnonymous(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please log in with Internet Identity");
    };
  };

  func generateUserId(role : UserRole) : Text {
    userCounter += 1;
    switch (role) {
      case (#organiser) { "O" # userCounter.toText() };
      case (#member) { "C" # userCounter.toText() };
    };
  };

  func generateGroupId() : Text {
    groupCounter += 1;
    "G" # groupCounter.toText();
  };

  func isRegisteredUser(caller : Principal) : Bool {
    users.containsKey(caller);
  };

  func requireRegisteredUser(caller : Principal) {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: User not registered");
    };
  };

  func isGroupOrganiser(caller : Principal, groupId : Text) : Bool {
    switch (groups.get(groupId)) {
      case (?group) { group.organiser == caller };
      case (null) { false };
    };
  };

  func isGroupMember(caller : Principal, groupId : Text) : Bool {
    memberships.containsKey((caller, groupId));
  };

  // Open to any non-anonymous principal (no prior registration required)
  public shared ({ caller }) func registerUser(name : Text, email : Text, role : UserRole) : async Text {
    requireNotAnonymous(caller);
    if (users.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    if (users.values().any(func(u) { u.email == email })) {
      Runtime.trap("Email already registered");
    };
    let id = generateUserId(role);
    let profile : UserProfile = { id; name; email; role; principal = caller };
    users.add(caller, profile);
    id;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireNotAnonymous(caller);
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (profile.principal != caller) {
      Runtime.trap("Unauthorized: Cannot modify another user's profile");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  // Open to any non-anonymous caller (needed for login flow)
  public query ({ caller }) func getUserByEmail(email : Text) : async ?UserProfile {
    requireNotAnonymous(caller);
    users.values().toArray().find(func(u) { u.email == email });
  };

  public shared ({ caller }) func createGroup(name : Text, duration : Nat, amount : Nat, capacity : Nat) : async Text {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#organiser) {};
          case (#member) { Runtime.trap("Unauthorized: Only organisers can create groups") };
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
    let groupId = generateGroupId();
    let group : ChitGroup = { id = groupId; name; duration; amount; capacity; organiser = caller; createdAt = Time.now() };
    groups.add(groupId, group);
    groupId;
  };

  public query ({ caller }) func getGroup(groupId : Text) : async ?ChitGroup {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (not isGroupMember(caller, groupId) and not isGroupOrganiser(caller, groupId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only group members can view group details");
    };
    groups.get(groupId);
  };

  public query ({ caller }) func getUserGroups() : async [ChitGroup] {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    memberships.values().toArray().filter(func(m) { m.user == caller }).map(
      func(m) { switch (groups.get(m.groupId)) { case (?g) { g }; case (null) { Runtime.trap("Group not found") } } }
    );
  };

  public shared ({ caller }) func joinGroup(groupId : Text) : async () {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#member) {};
          case (#organiser) { Runtime.trap("Unauthorized: Organisers cannot join groups as members") };
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
    switch (groups.get(groupId)) {
      case (?group) {
        let currentMembers = memberships.values().toArray().filter(func(m) { m.groupId == groupId }).size();
        if (currentMembers >= group.capacity) { Runtime.trap("Group is at full capacity") };
      };
      case (null) { Runtime.trap("Group not found") };
    };
    if (memberships.containsKey((caller, groupId))) { Runtime.trap("Already a member of this group") };
    memberships.add((caller, groupId), { groupId; user = caller; joinedAt = Time.now() });
  };

  public query ({ caller }) func getGroupMembers(groupId : Text) : async [UserProfile] {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (not isGroupMember(caller, groupId) and not isGroupOrganiser(caller, groupId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only group members or organiser can view member list");
    };
    memberships.values().toArray().filter(func(m) { m.groupId == groupId }).map(
      func(m) { switch (users.get(m.user)) { case (?u) { u }; case (null) { Runtime.trap("User not found") } } }
    );
  };

  public shared ({ caller }) func makePayment(groupId : Text, month : Nat, amount : Nat) : async () {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (not isGroupMember(caller, groupId)) { Runtime.trap("Unauthorized: Only group members can make payments") };
    if (not groups.containsKey(groupId)) { Runtime.trap("Group not found") };
    let key = (caller, groupId, month);
    if (payments.containsKey(key)) { Runtime.trap("Payment already made for this month") };
    payments.add(key, { groupId; user = caller; month; amount; paidAt = Time.now() });
  };

  public query ({ caller }) func getPaymentHistory(groupId : Text) : async [Payment] {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (not isGroupOrganiser(caller, groupId) and not AccessControl.isAdmin(accessControlState, caller)) {
      payments.values().toArray().filter(func(p) { p.groupId == groupId and p.user == caller });
    } else {
      payments.values().toArray().filter(func(p) { p.groupId == groupId });
    };
  };

  public shared ({ caller }) func closeAuction(groupId : Text, month : Nat, winner : Principal, bidAmount : Nat) : async () {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    switch (groups.get(groupId)) {
      case (?group) {
        if (group.organiser != caller) { Runtime.trap("Unauthorized: Only the group organiser can close auctions") };
      };
      case (null) { Runtime.trap("Group not found") };
    };
    if (not isGroupMember(winner, groupId)) { Runtime.trap("Winner must be a member of the group") };
    let key = (groupId, month);
    if (auctions.containsKey(key)) { Runtime.trap("Auction already closed for this month") };
    auctions.add(key, { groupId; month; winner; bidAmount; closedAt = Time.now() });
  };

  public query ({ caller }) func getAuctionHistoryForGroup(groupId : Text) : async [Auction] {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (not isGroupMember(caller, groupId) and not isGroupOrganiser(caller, groupId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only group members can view auction history");
    };
    auctions.values().toArray().filter(func(a) { a.groupId == groupId });
  };

  public query ({ caller }) func getAuctionHistoryForUser(user : Principal) : async [Auction] {
    requireNotAnonymous(caller);
    requireRegisteredUser(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own auction history");
    };
    auctions.values().toArray().filter(func(a) { a.winner == user });
  };
};
