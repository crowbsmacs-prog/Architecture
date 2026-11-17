# Практична №3 — Architecture review (60 балів)

Виконав: Омельчук Максим, ІПЗ-33.

## Findings before changes

| Принцип | Evidence (початковий код) | Практичний ризик | Напрям виправлення |
|---|---|---|---|
| Information hiding | `src/checkout/CheckoutController.ts:3,16-23` | Checkout знає тип StripePayload; зміна provider змушує редагувати transport layer | Сховати payload за Payments API на вищому рівні |
| Low coupling / dependency direction | `src/orders/OrderService.ts:4` і `src/payments/internal/StripeClient.ts:1-2,20` | Цикл між Payments і Orders; зміна одного модуля впливає на інший | Прибрати callback до Orders з StripeClient |
| Ownership | `src/orders/OrderService.ts:15-25` | Orders напряму змінює stock, оминає правила Inventory; можливе часткове резервування | Перенести резервування у Inventory (наступний рівень) |
| High cohesion / design for change | `src/orders/mapPaymentStatus.ts:3-6`, `src/reports/mapPaymentStatus.ts:3-6`, `src/notifications/mapPaymentStatus.ts:3-6` | Зміна статусу вимагає трьох правок; логіка може розійтися | Єдина нормалізація в Payments |
| Local reasoning | `src/shared/calculateTotal.ts:1,15-21` | Результат залежить від глобальної конфігурації, функція мутує lines і auditLog | Передавати параметри явно; зробити pure на рівні 75 |
| Explicit contracts | `src/orders/mapPaymentStatus.ts:3-6` | `requires_action` перетворюється на `pending`; новий статус `processing` не визначений | Єдиний стабільний тип PaymentStatus у Payments |

## Change impact prediction — до реалізації

**Requirement:** Єдиний provider-specific mapping у Payments, новий `processing`, старі `paid` і `failed` незмінні.

**Expected files:** `src/payments/normalizePaymentStatus.ts`, три старі `mapPaymentStatus.ts`, `src/orders/OrderService.ts`, `src/payments/internal/StripeClient.ts`, нові unit tests.

**Modules that should not change:** `src/checkout/CheckoutController.ts`, `src/inventory/StockRepository.ts`, `src/shared/calculateTotal.ts`, база даних і старі функціональні тести.

## Actual impact — після реалізації

**Actual files changed:** `src/payments/normalizePaymentStatus.ts`, три compatibility re-export, `src/orders/OrderService.ts`, `src/payments/internal/StripeClient.ts`, `tests/payment-status.unit.test.ts`, документація.

**Difference from prediction:** Файли збіглися з прогнозом. Додатково видалено непотрібну мутацію Orders усередині StripeClient; усі старі тести залишено незмінними. Рефакторинг stock ownership і calculateTotal навмисно відкладено до рівня 75.
