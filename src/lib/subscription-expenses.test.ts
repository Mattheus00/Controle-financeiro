import { describe, expect, it } from "vitest";
import {
  projectedSubscriptionExpenses,
  subscriptionChargeDates,
} from "@/lib/subscription-expenses";

describe("subscriptionChargeDates", () => {
  it("places the charge on the billing day inside the range", () => {
    expect(
      subscriptionChargeDates(
        { billing_day: 10, created_at: "2026-07-01T00:00:00Z" },
        "2026-08-01",
        "2026-08-14",
      ),
    ).toEqual(["2026-08-10"]);
  });

  it("pins a future billing day in the current month to today so new subscriptions show up", () => {
    expect(
      subscriptionChargeDates(
        { billing_day: 20, created_at: "2026-08-14T12:00:00Z" },
        "2026-07-16",
        "2026-08-14",
      ),
    ).toEqual(["2026-08-14"]);
  });

  it("covers each month in a longer range", () => {
    expect(
      subscriptionChargeDates(
        { billing_day: 10, created_at: "2026-06-01T00:00:00Z" },
        "2026-06-15",
        "2026-08-14",
      ),
    ).toEqual(["2026-07-10", "2026-08-10"]);
  });

  it("does not invent charges before the subscription existed", () => {
    expect(
      subscriptionChargeDates(
        { billing_day: 5, created_at: "2026-08-10T00:00:00Z" },
        "2026-07-01",
        "2026-08-14",
      ),
    ).toEqual(["2026-08-05"]);
  });
});

describe("projectedSubscriptionExpenses", () => {
  const netflix = {
    amount_cents: 5590,
    billing_day: 10,
    name: "Netflix",
    merchant: "Netflix",
    created_at: "2026-08-01T00:00:00Z",
    category_id: null,
    categories: null,
  };

  it("adds the subscription to the chart when no matching transaction exists", () => {
    const projected = projectedSubscriptionExpenses([netflix], [], "2026-08-01", "2026-08-14");
    expect(projected).toEqual([
      {
        date: "2026-08-10",
        amount_cents: 5590,
        name: "Netflix",
        category: {
          name: "Assinaturas",
          slug: "assinaturas",
          color: "#6366F1",
          icon: "RefreshCw",
        },
      },
    ]);
  });

  it("skips the projection when the expense was already launched", () => {
    const projected = projectedSubscriptionExpenses(
      [netflix],
      [
        {
          amount_cents: 5590,
          type: "expense",
          date: "2026-08-10",
          merchant: "NETFLIX.COM",
          description: "Netflix",
        },
      ],
      "2026-08-01",
      "2026-08-14",
    );
    expect(projected).toEqual([]);
  });
});
