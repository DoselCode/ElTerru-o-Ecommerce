# Tasks: Modal UX and Close Button Visibility

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150-200 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Shared Modal Close Infrastructure and Integration | PR 1 | `pnpm test` | Admin POS / Register manual interaction | Remove new admin components & CSS classes |

## Phase 1: Foundation (Components, Hooks & Styling)

- [x] 1.1 Create `src/admin/ModalCloseButton.tsx` with accessible button, 44x44px target, `aria-label="Cerrar"`, and Phosphor `X` icon.
- [x] 1.2 Create `src/admin/useModalDismiss.ts` with Escape key listener and backdrop click handler.
- [x] 1.3 Add `.modal-close` and modal header styling in `src/admin/admin.css` with focus rings, hover contrast, and positioning.

## Phase 2: Modal Integrations

- [x] 2.1 Update `src/admin/PaymentModal.tsx` to add `ModalCloseButton`, `useModalDismiss` (protected: `closeOnBackdrop: false`), dialog attributes.
- [x] 2.2 Update `src/admin/SaleDetailModal.tsx` to upgrade close button to `ModalCloseButton` and use `useModalDismiss` (informational: `closeOnBackdrop: true`).
- [x] 2.3 Update `src/admin/RegisterModule.tsx` to add `ModalCloseButton` and `useModalDismiss` (protected: `closeOnBackdrop: false`) across open, close, and movement modals.
- [x] 2.4 Update `src/admin/POS.tsx` to add `ModalCloseButton` and `useModalDismiss` (informational: `closeOnBackdrop: true`) on `showSuccessModal`.
- [x] 2.5 Update `src/admin/Stock.tsx` to add `ModalCloseButton` and `useModalDismiss` (protected: `closeOnBackdrop: false`) on deletion confirmation modal.
- [x] 2.6 Update `src/admin/ProductForm.tsx` to add `ModalCloseButton` and `useModalDismiss` on save success modal.

## Phase 3: Verification & Tests

- [x] 3.1 Create unit test `src/admin/__tests__/ModalCloseButton.test.tsx` verifying render, accessible label, and click handler.
- [x] 3.2 Run test suite and typecheck (`pnpm test` and `pnpm build`) to verify no regressions.


