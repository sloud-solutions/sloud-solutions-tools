// Small shared UI helpers used across the password forms and modals.

/** Shows `warningEl` while Caps Lock is on for keystrokes inside `input`. */
export function watchCapsLock(input: HTMLInputElement, warningEl: HTMLElement) {
  const check = (event: KeyboardEvent) => {
    const on = event.getModifierState?.("CapsLock") ?? false;
    warningEl.classList.toggle("hidden", !on);
  };
  input.addEventListener("keydown", check);
  input.addEventListener("keyup", check);
  input.addEventListener("blur", () => warningEl.classList.add("hidden"));
}

/** Opens a modal built from a backdrop + panel pair (see the `modal-*` CSS classes). */
export function openModal(overlay: HTMLElement) {
  overlay.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

export function closeModal(overlay: HTMLElement) {
  overlay.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}
