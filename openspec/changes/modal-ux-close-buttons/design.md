# Design: modal-ux-close-buttons

## 1. Overview

This change gives every admin modal a consistent, accessible close action. It adds two shared building blocks, a `ModalCloseButton` component and a `useModalDismiss` hook, and wires them into six existing modal surfaces. Styling goes in `src/admin/admin.css`.

Goals:
- A visible close button (X icon) on every modal, with a minimum 44×44px hit box.
- Escape key dismissal for all modals.
- Backdrop-click dismissal only where it is safe.
- No duplicated button markup or key listeners.

Non-goals:
- Focus trapping and focus restoration (a possible follow-up).
- Animation changes.
- A modal framework or portal refactor.

Stack: React 18, Vite, TypeScript, `@phosphor-icons/react`, custom CSS.

## 2. Architecture Decisions

### Decision 1: Shared `ModalCloseButton` component vs repeated markup

**Choice:** a reusable `src/admin/ModalCloseButton.tsx`.

**Rationale:**
- Six modals need identical semantics: `type="button"`, `aria-label`, icon, and hit-box class.
- A single component keeps accessibility and styling consistent and makes later changes one-line edits.
- Repeating the markup would let the label, sizing, and `type` attribute drift between modals.

**Alternatives rejected:**
- Inline `<button>` in each modal. Rejected because it duplicates markup and invites drift.
- A full `Modal` wrapper component. Rejected as too invasive for this change, since each modal has its own layout and state.

**Interface:**
```ts
interface ModalCloseButtonProps {
  onClose: () => void;
  label?: string;       // default "Cerrar"
  className?: string;   // optional extra class
  disabled?: boolean;
}
```
- Renders `<button type="button" className="modal-close-btn …" aria-label={label} onClick={onClose} disabled={disabled}>` containing a Phosphor `X` icon with `aria-hidden="true"`.
- The icon uses `weight="bold"` and `size={20}`.

### Decision 2: Escape and backdrop dismissal mechanism

**Choice:** a reusable hook `src/admin/useModalDismiss.ts`.

**Interface:**
```ts
interface UseModalDismissOptions {
  onClose: () => void;
  closeOnBackdrop?: boolean; // default false
  closeOnEscape?: boolean;   // default true
  enabled?: boolean;         // default true; lets callers gate on "open" state
}
interface UseModalDismissResult {
  onBackdropClick: (e: React.MouseEvent<HTMLElement>) => void;
}
function useModalDismiss(opts: UseModalDismissOptions): UseModalDismissResult;
```

**Behavior:**
- A `useEffect` registers a `keydown` listener on `window` when `enabled && closeOnEscape`. It calls `onClose` when `e.key === "Escape"`.
- The effect removes the listener on cleanup and when dependencies change.
- The latest `onClose` is held in a ref, so the listener is not re-registered on every render.
- `onBackdropClick` calls `onClose` only if `closeOnBackdrop` is true and `e.target === e.currentTarget`. Clicks that bubble up from modal content are therefore ignored.
- The hook is applied to the backdrop element as `onClick={onBackdropClick}`.

**Alternatives rejected:**
- Per-modal `useEffect` listeners. Rejected because they duplicate code and risk leaked listeners.
- Document-level click-outside detection with refs. Rejected as more complex than the `target === currentTarget` check.

### Decision 3: Backdrop dismissal policy

**Choice:** a per-modal `closeOnBackdrop` flag.

| Modal | Type | `closeOnBackdrop` | Escape |
|---|---|---|---|
| SaleDetailModal | Informational | `true` | yes |
| POS success modal | Informational | `true` | yes |
| ProductForm success modal | Informational | `true` | yes |
| PaymentModal | Protected | `false` | yes |
| RegisterModule | Protected | `false` | yes |
| Stock deletion modal | Protected | `false` | yes |

**Rationale:** informational modals carry no unsaved input or irreversible intent, so accidental dismissal is harmless. Protected modals involve payment entry, cash register data, or destructive confirmation, where a stray click outside could lose work or cause confusion. The explicit close button and Escape remain available as deliberate actions.

**Note:** Escape on protected modals runs the same `onClose` as the visible close button. Each caller must ensure that handler is safe, meaning it resets transient state and does not commit a payment or deletion.

## 3. File Changes

| File | Action | Description |
|---|---|---|
| `src/admin/ModalCloseButton.tsx` | Create | Shared close button component |
| `src/admin/useModalDismiss.ts` | Create | Escape and backdrop dismissal hook |
| `src/admin/admin.css` | Modify | Add `.modal-close-btn` styles and positioning |
| `src/admin/PaymentModal.tsx` | Modify | Add button and hook, `closeOnBackdrop: false` |
| `src/admin/SaleDetailModal.tsx` | Modify | Add button and hook, `closeOnBackdrop: true` |
| `src/admin/RegisterModule.tsx` | Modify | Add button and hook, `closeOnBackdrop: false` |
| `src/admin/POS.tsx` | Modify | Add button and hook to the success modal, `closeOnBackdrop: true` |
| `src/admin/Stock.tsx` | Modify | Add button and hook to the deletion modal, `closeOnBackdrop: false` |
| `src/admin/ProductForm.tsx` | Modify | Add button and hook to the success modal, `closeOnBackdrop: true` |
| `src/admin/ModalCloseButton.test.tsx` | Create | Component unit tests |
| `src/admin/useModalDismiss.test.tsx` | Create | Hook tests |

### CSS design (`admin.css`)
```css
.modal-close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.modal-close-btn:hover { background: rgba(0, 0, 0, 0.06); }
.modal-close-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.modal-close-btn:disabled { opacity: 0.5; cursor: not-allowed; }
```
- Each modal container must be `position: relative`. This is verified per modal during implementation, and a rule is added only where it is missing.
- Existing class names and layouts are preserved. Header padding may need a small right-hand adjustment so titles do not overlap the button.

### Integration pattern
```tsx
const { onBackdropClick } = useModalDismiss({ onClose, closeOnBackdrop: false });

<div className="modal-backdrop" onClick={onBackdropClick}>
  <div className="modal" role="dialog" aria-modal="true">
    <ModalCloseButton onClose={onClose} />
    {/* existing content */}
  </div>
</div>
```
- For modals rendered conditionally inside a parent component (POS, Stock, ProductForm), the hook is extracted into a small inner component, or `enabled` is set to the open state. This keeps hook calls unconditional and honors the Rules of Hooks.
- Where the modal lacks `role="dialog"` and `aria-modal`, they are added as a low-risk accessibility improvement.

## 4. Edge Cases and Risks

- **Stacked modals:** if two modals are open at once, Escape would close both. Current flows do not stack them. If one does, the topmost listener should handle the event (`stopPropagation` is not sufficient on `window`), so this is noted as a known limitation.
- **Busy states:** while a payment or submit is in flight, the close button can be disabled through the `disabled` prop. Callers pass their pending flag, and the hook's `enabled` option is set to false in the same state.
- **Text selection drag:** a drag that starts inside the modal and ends on the backdrop produces a click whose target is the common ancestor, which can be the backdrop. This is accepted for informational modals and moot for protected ones.
- **Z-index and overflow:** the absolute-positioned button depends on the modal container not clipping overflow. This is verified visually.
- **Rollback:** the change is additive and isolated to presentation and event handling. Reverting is a file-level revert.

## 5. Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## 6. Testing Strategy

### Unit tests: `ModalCloseButton`
- Renders a `button` with `type="button"`.
- Default `aria-label` is "Cerrar", and a custom `label` overrides it.
- Has the `modal-close-btn` class, which provides the 44px hit box. jsdom does not compute the stylesheet, so the test asserts the class and the CSS file review confirms the 44px dimensions.
- Clicking calls `onClose` exactly once.
- `disabled` prevents `onClose` from firing.
- The icon is `aria-hidden`.

### Hook tests: `useModalDismiss`
Tested through a small harness component.
- Pressing Escape calls `onClose`.
- Other keys do not call `onClose`.
- With `closeOnEscape: false` or `enabled: false`, Escape does nothing.
- The listener is removed on unmount, verified by dispatching Escape after unmount.
- Clicking the backdrop itself calls `onClose` when `closeOnBackdrop: true`.
- Clicking inside child content does not call `onClose`, because `target !== currentTarget`.
- With `closeOnBackdrop: false` (the default), a backdrop click does nothing.
- A changing `onClose` identity does not re-register the listener, and the latest callback is the one invoked.

### Component and integration checks
- Per modal, manual verification of: the visible close button, Escape closing, and the backdrop policy from the table in Decision 3.
- Verify that closing a protected modal through Escape or the button does not trigger payment, registration, or deletion side effects.

### Build verification
- `tsc --noEmit` passes with no type errors.
- `vite build` completes successfully.
- Existing tests continue to pass.

### Tooling note
If the repository has no test runner, add Vitest with `@testing-library/react` and `jsdom` as dev dependencies. Otherwise reuse the existing one. This is confirmed during the tasks phase.

## 7. Acceptance Mapping

- Close button present on all six modals: Decisions 1 and 3, file changes.
- Accessible name and 44px target: component interface, CSS, unit tests.
- Escape dismissal everywhere: Decision 2, hook tests.
- Backdrop policy respected: Decision 3, hook tests, manual checks.
- No regressions: build verification and existing tests.