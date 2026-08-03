export type CourseAccessDecision =
  | { allowed: true; source: "admin" | "free" | "premium" }
  | {
      allowed: false;
      reason:
        | "authentication_required"
        | "onboarding_required"
        | "suspended"
        | "wrong_level"
        | "wrong_offering"
        | "locked";
    };

export function evaluateCourseAccess(input: {
  authenticated: boolean;
  onboardingComplete: boolean;
  accountActive: boolean;
  admin: boolean;
  sameLevel: boolean;
  sameOffering: boolean;
  freeAssignment: boolean;
  premiumEntitlement: boolean;
}): CourseAccessDecision {
  if (!input.authenticated) return { allowed: false, reason: "authentication_required" };
  if (!input.onboardingComplete) return { allowed: false, reason: "onboarding_required" };
  if (!input.accountActive) return { allowed: false, reason: "suspended" };
  if (input.admin) return { allowed: true, source: "admin" };
  if (input.premiumEntitlement) return { allowed: true, source: "premium" };
  if (!input.sameLevel) return { allowed: false, reason: "wrong_level" };
  if (!input.sameOffering) return { allowed: false, reason: "wrong_offering" };
  if (input.freeAssignment) return { allowed: true, source: "free" };
  return { allowed: false, reason: "locked" };
}
