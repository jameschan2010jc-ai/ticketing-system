import type { HomeContentResponse } from "@packages/shared-types";
import {
  getParkConfig,
  listTicketTypes
} from "../repositories/admin-config.repository";

export async function getHomeContent(
  parkId = "demo-park"
): Promise<HomeContentResponse> {
  const park = await getParkConfig(parkId);
  const tickets = await listTicketTypes(parkId).catch(() => []);
  const startingPrice =
    tickets.length > 0
      ? Math.min(...tickets.map((ticket) => ticket.price))
      : 120;

  if (park) {
    return {
      park: {
        heroImageUrl: park.heroImageUrl,
        intro: park.intro,
        name: park.name,
        openDateRange: `${park.openDateStart} to ${park.openDateEnd}`,
        parkId: park.parkId
      },
      primaryAction: {
        label: "Start Purchase",
        targetPage: "p2",
        targetRoute: "/purchase-method"
      },
      ticketSummary: {
        currency: park.currency,
        maxTicketsPerOrder: 1,
        startingPrice
      }
    };
  }

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
