# Proposal: Modal UX and Close Button Visibility

## Intent

Admin modals in ElTerru-o-Ecommerce are inconsistent and hard to dismiss. Most have no visible "X" close button, and the one that does (`SaleDetailModal`) is a low-prominence icon with weak hover feedback and a small touch target. Users, especially on touch devices at the POS, can get stuck or have to guess how to leave a dialog.

This change introduces a standardized, highly visible, accessible close pattern for every admin modal. It follows react-ui-patterns guidance:
- Touch targets of at least 44x44px.
- Clear contrast with visible hover and focus states.
- Keyboard dismissal with Escape.
- Safe backdrop dismiss.
- A consistent modal header.

## Scope

### In Scope
- Create a reusable modal close button, plus an optional modal header pattern (title and close button, top-right placement), built on `@phosphor-icons/react` `X` icon.
- Add the close button to all modals that lack one:
  - `PaymentModal.tsx`
  - `RegisterModule.tsx` (Cierre de Caja, Apertura, Movimiento)
  - `POS.tsx` (sale success modal)
  - `Stock.tsx` (product deletion confirmation)
  - `ProductForm.tsx` (product save success)
- Upgrade the existing close button in `SaleDetailModal.tsx` to the new standard.
- Update `admin.css` with:
  - modal overlay and modal container styles;
  - a `.modal-close` class with a minimum 44x44px hit area, high-contrast icon color, hover background, and a `:focus-visible` ring;
  - consistent top-right placement.
- Accessibility:
  - `aria-label="Cerrar"` on the close button (UI text stays in Spanish).
  - `role="dialog"` and `aria-modal="true"` on the modal container.
  - Escape key closes the modal.
  - Backdrop click closes the modal only for non-destructive and non-in-progress modals.
- Review the modals for other UX problems (focus handling, scroll behavior, mobile sizing) and fix the low-risk ones.

### Out of Scope
- Redesigning modal content, business logic, or form flows.
- Introducing a third-party modal or dialog library.
- Full focus-trap implementation across the app (note it as a follow-up if not trivial).
- Storefront (non-admin) UI changes, unless a modal is found there.
- Changing payment, register, or stock behavior.

## Capabilities

### New Capabilities
- modal-close-action: Standardized, highly visible, accessible close button and dismiss behavior for all modal dialogs.

### Modified Capabilities
None

## Approach

1. **Shared component**: add a small `ModalCloseButton` (and optionally `ModalHeader`) component in `src/admin/`, with props `onClick`, an optional `label`, and an optional `size`.
2. **Escape handling**: add a `useModalDismiss(onClose, { closeOnBackdrop })` hook or equivalent. It registers a `keydown` listener for Escape on mount, cleans it up on unmount, and provides a backdrop click handler that checks `e.target === e.currentTarget`.
3. **CSS**: define `.modal-close` in `admin.css` (at least 44x44px, rounded, a visible neutral or contrasting background, stronger hover, and a 2–3px focus-visible outline). Use `position: absolute; top/right` on a `position: relative` modal container, or flex-end in the header.
4. **Rollout**: apply to each modal. For the destructive deletion confirmation and the in-progress register or payment flows, keep backdrop dismiss disabled and allow explicit close (X, Escape, Cancel) only. Success modals route X to the same handler as their primary "Cerrar/Aceptar" action, so state is reset consistently.
5. **Verification**: manually test each modal for mouse, touch, and keyboard. Run `tsc` and the build.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/admin/admin.css` | Modified | Overlay and modal styles, `.modal-close` styles (hit area, contrast, hover, focus ring), header layout |
| `src/admin/ModalCloseButton.tsx` (new) | New | Reusable accessible close button |
| `src/admin/useModalDismiss.ts` (new) | New | Escape and backdrop dismiss hook |
| `src/admin/PaymentModal.tsx` | Modified | Add header with X, dialog roles, Escape |
| `src/admin/SaleDetailModal.tsx` | Modified | Replace `btn-icon` X with the standard button |
| `src/admin/RegisterModule.tsx` | Modified | Add X to the 3 modals |
| `src/admin/POS.tsx` | Modified | Add X to the sale success modal |
| `src/admin/Stock.tsx` | Modified | Add X to the deletion confirmation modal |
| `src/admin/ProductForm.tsx` | Modified | Add X to the save success modal |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Accidental dismissal loses form data (register or payment) | Medium | Disable backdrop dismiss on data-entry and destructive modals; Escape and X remain explicit actions |
| X on a success modal skips post-success logic (reset, navigation) | Medium | Wire X to the same handler as the primary close button |
| CSS changes affect other elements using `.btn-icon` or modal classes | Low | Use the new scoped `.modal-close` class; do not alter `.btn-icon` globally |
| Absolute positioning overlaps titles on small screens | Low | Reserve header padding; test at mobile widths |
| Multiple stacked modals all close on a single Escape | Low | Handle Escape only in the topmost or active modal |
| Admin CSS and Tailwind styles conflict | Low | Keep styles in `admin.css` with specific selectors |

## Rollback Plan

Changes are limited to the front-end admin UI, with no data or API impact. Revert the change's commit(s) with `git revert`. This removes the two new files, the per-modal edits, and the `admin.css` additions. Because the new CSS class is scoped, a partial rollback is also possible by removing individual modal usages without affecting the others.

## Dependencies

- Existing `@phosphor-icons/react` (`X` icon); no new packages.
- React 18 hooks.
- Existing `admin.css` design tokens and variables, if available, for color and contrast.

## Success Criteria

- [ ] All 8 modals (Payment, SaleDetail, 3 in Register, POS success, Stock delete, ProductForm success) display a visible X close button in a consistent top-right position.
- [ ] Each close button has a hit area of at least 44x44px and an `aria-label`.
- [ ] Icon and background contrast meets WCAG AA (at least 4.5:1 for the icon against its background), with a visible hover state and `:focus-visible` ring.
- [ ] Escape closes every modal and does not close underlying ones.
- [ ] Backdrop click closes only non-destructive, non-data-entry modals.
- [ ] Modal containers use `role="dialog"` and `aria-modal="true"`.
- [ ] Closing via X triggers the same state cleanup as the existing close or cancel actions.
- [ ] No regressions in payment, register, stock, or product flows; `tsc` and the build pass.
- [ ] Verified manually on desktop and mobile widths with mouse, touch, and keyboard.