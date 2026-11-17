// Single source of truth for mapping provider statuses into our domain.
export type PaymentStatus = "paid" | "processing" | "failed";

export function normalizePaymentStatus(
  response: { state?: unknown } | null | undefined,
): PaymentStatus {
  switch (response?.state) {
    case "succeeded":
      return "paid";
    case "requires_action":
      return "processing";
    case "declined":
      return "failed";
    default:
      // Fail closed: unknown is never interpreted as a successful charge.
      return "failed";
  }
}
