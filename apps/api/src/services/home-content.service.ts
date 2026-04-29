import type { HomeContentResponse } from "@packages/shared-types";

export function getHomeContent(): HomeContentResponse {
  return {
    park: {
      parkId: "demo-park",
      name: "Smart Scenic Park",
      intro:
        "Plan your visit, choose an entry time, and keep your QR ticket ready for fast admission.",
      heroImageUrl: "/images/demo-park.jpg",
      openDateRange: "2026-05-01 to 2026-12-31"
    },
    ticketSummary: {
      startingPrice: 120,
      currency: "TWD",
      maxTicketsPerOrder: 1
    },
    primaryAction: {
      label: "Start Purchase",
      targetPage: "p2",
      targetRoute: "/purchase-method"
    }
  };
}
