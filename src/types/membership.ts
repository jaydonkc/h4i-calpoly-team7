export type Membership = {
  plan: string;
  price: string;
  renewalDate: string;
  memberId: string;
  status: "active" | "expired";
  source: "manual_demo" | "demo_checkout" | "default_demo";
};
