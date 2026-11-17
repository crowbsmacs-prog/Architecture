# DECISIONS.md — Практична №3 (60 балів)

## Decision 1: Єдина нормалізація статусів у Payments

**Problem:** Однакова функція `mapPaymentStatus` знаходилась у Orders, Reports та Notifications. При зміні правил вона могла давати різні результати в різних частинах системи.

**Evidence:** `src/orders/mapPaymentStatus.ts:3-6`, аналогічні файли в Reports і Notifications.

**Decision:** Створити `src/payments/normalizePaymentStatus.ts` з типом `PaymentStatus` і єдиним перетворенням статусів. Старі entrypoints зробити простими re-export без власної логіки.

**Why:** Знання про Stripe належить Payments. Новий статус `processing` додається в одному місці.

**Alternative:** Залишити три копії і синхронізувати їх вручну.

**Why rejected:** Такий підхід створює ризик розходження бізнес-логіки.

**Trade-off:** Споживачі залежать від єдиного модуля нормалізації.

**Verification:** Unit-тести чотирьох статусів і перевірка ідентичності re-export.

## Decision 2: Невідомий статус — не успіх

**Problem:** Платіжний провайдер може повернути новий або пошкоджений статус; також потрібен сценарій `processing`.

**Evidence:** `src/payments/internal/StripeClient.ts:18-20` і початкові status mapping, де `requires_action` давав `pending`.

**Decision:** `succeeded` перетворюється на `paid`, `requires_action` — на `processing`, `declined` — на `failed`, невідоме значення — на `failed`. Тестовий токен `process_` дає `requires_action`. Усунено прихований запис у Orders всередині StripeClient.

**Why:** Невідомий статус не повинен підтверджувати оплату, а оновлення замовлення має залишатися за Orders.

**Alternative:** Кидати помилку для кожного невідомого статусу.

**Why rejected:** Для поточного навчального API обрали стабільну, консервативну відповідь замість аварійного завершення.

**Trade-off:** `failed` може вимагати подальшої ручної звірки з провайдером, бо невідоме значення не доводить фактичну відмову.

**Verification:** Старі тести `paid/failed`, нові тести `processing/unknown` і Checkout API.

## AI review

**Корисна пропозиція:** Централізувати нормалізацію та перевірити її окремими unit-тестами.

**Відхилена пропозиція:** Повністю переписувати систему на окремі payment services для рівня 60 — зайва складність і ризик регресії.

**Як перевірено:** Початкові функціональні тести збережено; після змін запущено всі `npm test`.
