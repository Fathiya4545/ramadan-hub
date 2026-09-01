// Single source of truth for who may administer the app.
//
// This decides only whether admin controls are RENDERED. What is actually
// permitted is enforced by firestore.rules, which must name the same
// addresses — keep the two in step, or you get buttons that fail on save.
//
// It lived in two components before and they drifted: the Parents portal
// still granted a personal address after the events page had moved to the
// academy account.
export const ADMIN_EMAILS = ['medinaacademylearning@gmail.com'];

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || '').toLowerCase());
}
