export type AccountAiUsage = {
  accountId: string;
  plan: "paid" | "trial" | "blocked";
  periodStart: string | null;
  balance: { used: number; limit: number; remaining: number; resets_at: string | null };
  usage: { items: { id: string; tool: string; cost: number; createdAt: string }[];
    total: number; page: number; pageSize: number };
};
