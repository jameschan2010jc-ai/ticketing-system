import type {
  GuestPurchaseNoticeResponse,
  PurchaseMethodOptionsResponse
} from "@packages/shared-types";

export function getPurchaseMethodOptions(): PurchaseMethodOptionsResponse {
  return {
    title: "Choose purchase method",
    options: [
      {
        id: "existing-account",
        label: "Existing account login",
        description: "Sign in before purchasing and keep tickets in your account.",
        targetPage: "p30",
        targetRoute: "/login-existing-account"
      },
      {
        id: "new-account",
        label: "Register new account",
        description: "Create an account with phone or email verification.",
        targetPage: "p40",
        targetRoute: "/register-method"
      },
      {
        id: "guest",
        label: "Direct purchase",
        description: "Continue as guest after reading the purchase notice.",
        targetPage: "p3",
        targetRoute: "/purchase-method/guest-notice"
      }
    ]
  };
}

export function getGuestPurchaseNotice(): GuestPurchaseNoticeResponse {
  return {
    title: "Guest purchase notice",
    paragraphs: [
      "Guest purchase is allowed for this park.",
      "Guest orders are stored for operations and statistics, but are not bound to a long-term account.",
      "Guest users cannot use profile self-service order lookup, modification, or refund flows."
    ],
    acknowledgementLabel: "I understand the guest purchase rules.",
    continueTargetPage: "p10",
    continueTargetRoute: "/purchase-content"
  };
}
