# Практична №3 — Рефакторинг під зміну вимог

Автор: Омельчук Максим, ІПЗ-33. Рівень: **60 балів**.

Навчальний checkout backend на основі `vivalafit/architecture-lab-3`.

## Запуск

Потрібен **Node.js 22.18 або новіший**. Залежності встановлювати не потрібно.

```powershell
npm test
npm start
```

## Результат

- `REVIEW.md` — аналіз шести проблем до змін, prediction і actual impact.
- `DECISIONS.md` — два рішення та AI review.
- Єдина реалізація status mapping в `src/payments/normalizePaymentStatus.ts`.
- Статуси: `paid`, `processing`, `failed`; невідомий статус консервативно стає `failed`.
- `process_` token симулює processing у локальному StripeClient.
- 3 старі функціональні та 6 нових тестів. Очікуваний підсумок: **9 passing tests**.

Обсяг рівня 60: ownership складу і pure calculateTotal не змінювалися. Секрети платежів не використовуються.
