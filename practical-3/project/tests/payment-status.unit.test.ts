import test from "node:test";
import assert from "node:assert/strict";
import { normalizePaymentStatus } from "../src/payments/normalizePaymentStatus.ts";
import { mapPaymentStatus as fromOrders } from "../src/orders/mapPaymentStatus.ts";
import { mapPaymentStatus as fromReports } from "../src/reports/mapPaymentStatus.ts";
import { mapPaymentStatus as fromNotifications } from "../src/notifications/mapPaymentStatus.ts";
import { CheckoutController } from "../src/checkout/CheckoutController.ts";
import { resetDatabase, database } from "../src/database.ts";

test("provider succeeded maps to paid", () => {
  assert.equal(normalizePaymentStatus({ state: "succeeded" }), "paid");
});

test("provider requires_action maps to processing", () => {
  assert.equal(normalizePaymentStatus({ state: "requires_action" }), "processing");
});

test("provider declined maps to failed", () => {
  assert.equal(normalizePaymentStatus({ state: "declined" }), "failed");
});

test("unknown provider status fails closed", () => {
  assert.equal(normalizePaymentStatus({ state: "unexpected" }), "failed");
  assert.equal(normalizePaymentStatus(null), "failed");
});

test("all old mapping entrypoints delegate to Payments", () => {
  assert.equal(fromOrders, normalizePaymentStatus);
  assert.equal(fromReports, normalizePaymentStatus);
  assert.equal(fromNotifications, normalizePaymentStatus);
});

test("checkout returns processing without changing the public response shape", async () => {
  resetDatabase();
  database.stock.set("book", { productId: "book", available: 3 });
  const response = await new CheckoutController().checkout({
    orderId: "order-processing",
    paymentToken: "process_test",
    currency: "UAH",
    lines: [{ productId: "book", unitPrice: 10, quantity: 1 }],
  });
  assert.deepEqual(response, {
    orderId: "order-processing",
    status: "payment_pending",
    total: 12,
    paymentStatus: "processing",
  });
});
