# modal-close-action Specification

## Purpose

Define a consistent, accessible, and safe way to dismiss every admin modal in ElTerru-o-Ecommerce. This capability introduces a shared close affordance (visible "X" button), keyboard dismissal (Escape), a backdrop-dismissal policy that distinguishes informational modals from transactional or destructive ones, and the dialog semantics required by assistive technologies. It aims to remove dead-end modals and prevent accidental data loss.

## Scope

In scope (admin modals):
- SaleDetailModal
- POS sale success modal
- PaymentModal
- RegisterModule modals (open register, close register, register movement)
- Stock deletion confirmation modal

Out of scope: non-admin storefront dialogs, toasts, and non-modal popovers or dropdowns.

## Definitions

- **Dismiss**: closing the modal and running the same cancel/reset logic used by the modal's secondary "Cancelar"/"Cerrar" button.
- **Informational modal**: a modal that only displays information or a success message and has no user inputs or pending transaction (SaleDetailModal, POS sale success modal).
- **Protected modal**: a modal with user inputs, transactional state, or a destructive action (PaymentModal, RegisterModule open/close/movement, Stock deletion confirm).

## Requirements

### Requirement: Visible Close Button

Every admin modal MUST render a visible close button ("X") in the upper-right area of the modal container.

#### Scenario: Close button is rendered in every modal
- GIVEN any in-scope admin modal is open
- WHEN the modal is rendered
- THEN a close button with an "X" icon is visible in the upper-right area of the modal
- AND it does not overlap or obscure the modal title or primary content

#### Scenario: Close button on modals with long content
- GIVEN a modal whose content requires scrolling
- WHEN the user scrolls the modal body
- THEN the close button remains reachable in the upper-right area of the modal (header or fixed position)

### Requirement: Close Button Hit Area

The close button's interactive hit area MUST be at least 44x44 CSS pixels.

#### Scenario: Minimum touch target
- GIVEN an admin modal is open
- WHEN the close button's rendered dimensions are measured
- THEN its width MUST be >= 44px and its height MUST be >= 44px
- AND the visual "X" icon MAY be smaller than the hit area

### Requirement: Close Button Accessible Name

The close button MUST have `aria-label="Cerrar"` and MUST be a native `<button type="button">` element (or equivalent role with keyboard operability).

#### Scenario: Screen reader announces the button
- GIVEN an admin modal is open
- WHEN a screen reader focuses the close button
- THEN it announces the name "Cerrar" and the role "button"

#### Scenario: Button does not submit forms
- GIVEN a modal containing a form
- WHEN the user activates the close button
- THEN the form MUST NOT be submitted

### Requirement: Close Button Visual States

The close button MUST display a visible hover state and a visible `:focus-visible` outline.

#### Scenario: Hover feedback
- GIVEN an admin modal is open
- WHEN the pointer hovers over the close button
- THEN the button shows a visible change (e.g., background or color)

#### Scenario: Keyboard focus indicator
- GIVEN an admin modal is open
- WHEN the close button receives focus via keyboard (Tab)
- THEN a clearly visible focus outline is displayed
- AND the outline is not displayed solely for mouse clicks

### Requirement: Close Button Dismiss Behavior

Clicking or tapping the close button MUST trigger the same dismiss and cancel/reset behavior as the modal's secondary cancel button.

#### Scenario: Close button equals cancel
- GIVEN a modal with a secondary "Cancelar" button that resets local state and closes the modal
- WHEN the user clicks the close button
- THEN the same handler logic runs, local state is reset, and the modal closes

#### Scenario: Touch activation
- GIVEN the user is on a touch device
- WHEN the user taps the close button
- THEN the modal is dismissed with the same behavior as the cancel button

#### Scenario: Close during pending transaction
- GIVEN a protected modal is in a submitting/processing state
- WHEN the user clicks the close button
- THEN the behavior MUST match that of the modal's cancel button in the same state (e.g., ignored if cancel is disabled)

### Requirement: Escape Key Dismissal

While a modal dialog is rendered, pressing the Escape key MUST dismiss the modal using the same behavior as the cancel button.

#### Scenario: Escape closes the modal
- GIVEN an admin modal is open
- WHEN the user presses Escape
- THEN the modal is dismissed and cancel/reset logic runs

#### Scenario: Escape with no modal
- GIVEN no modal is rendered
- WHEN the user presses Escape
- THEN no modal-related handler runs and no side effects occur

### Requirement: Escape Listener Lifecycle

The Escape key listener MUST be registered when the modal mounts and MUST be removed when the modal unmounts. The listener MUST NOT close underlying layered views or modals.

#### Scenario: Cleanup on unmount
- GIVEN a modal registered an Escape listener
- WHEN the modal unmounts
- THEN the listener is removed
- AND subsequent Escape presses do not invoke the modal's dismiss handler

#### Scenario: Layered modals
- GIVEN two modals are stacked (a top modal over an underlying modal or view)
- WHEN the user presses Escape
- THEN only the topmost modal is dismissed
- AND the underlying modal or view remains open

#### Scenario: No duplicate listeners
- GIVEN a modal opens and closes repeatedly
- WHEN the modal is reopened
- THEN exactly one active Escape listener exists for it

### Requirement: Backdrop Dismissal for Informational Modals

Informational modals (SaleDetailModal, POS sale success modal) SHOULD be dismissed when the user clicks the backdrop overlay outside the modal content.

#### Scenario: Backdrop click closes informational modal
- GIVEN SaleDetailModal or the POS sale success modal is open
- WHEN the user clicks the backdrop overlay (not the modal content)
- THEN the modal is dismissed

#### Scenario: Click inside content does not dismiss
- GIVEN an informational modal is open
- WHEN the user clicks inside the modal content
- THEN the modal remains open

### Requirement: Backdrop Protection for Protected Modals

Protected modals (PaymentModal, RegisterModule open/close/movement modals, Stock deletion confirmation) MUST NOT be dismissed when the user clicks the backdrop overlay.

#### Scenario: Backdrop click ignored in PaymentModal
- GIVEN PaymentModal is open with entered data
- WHEN the user clicks the backdrop overlay
- THEN the modal remains open and entered data is preserved

#### Scenario: Backdrop click ignored in RegisterModule modals
- GIVEN a RegisterModule open, close, or movement modal is open
- WHEN the user clicks the backdrop overlay
- THEN the modal remains open

#### Scenario: Backdrop click ignored in stock deletion confirmation
- GIVEN the Stock deletion confirmation modal is open
- WHEN the user clicks the backdrop overlay
- THEN the modal remains open and no deletion occurs

#### Scenario: Protected modals still dismissible explicitly
- GIVEN a protected modal is open
- WHEN the user clicks the close button or presses Escape
- THEN the modal is dismissed with cancel/reset behavior

### Requirement: Dialog Semantics

The modal wrapper MUST have `role="dialog"` and `aria-modal="true"`. The modal SHOULD be labelled by its header title (e.g., `aria-labelledby` referencing the title element's id) so that screen readers announce clear context.

#### Scenario: Roles and attributes present
- GIVEN any in-scope admin modal is open
- WHEN the DOM is inspected
- THEN the modal wrapper has `role="dialog"` and `aria-modal="true"`

#### Scenario: Title provides context
- GIVEN a modal with a visible header title
- WHEN a screen reader enters the dialog
- THEN the dialog is announced with the title text as its accessible name

#### Scenario: Decorative icon hidden
- GIVEN the close button contains an SVG or icon glyph
- WHEN assistive technology reads the button
- THEN the icon is hidden from the accessibility tree (e.g., `aria-hidden="true"`) and only "Cerrar" is announced

## Non-Functional Considerations

- The close button styling SHOULD be consistent across all modals (shared component or shared style).
- Changes MUST NOT alter existing cancel/confirm business logic beyond routing the new dismiss paths to it.
- Close button color contrast SHOULD meet WCAG 2.1 AA (3:1 for UI components).