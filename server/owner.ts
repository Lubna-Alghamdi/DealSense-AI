import { fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server";

export function currentOwnerEmail(): string {
  const email = getRequestUserEmail();
  if (!email) fail("Sign in to continue", { statusCode: 401 });
  return email.toLowerCase();
}

export function comparisonIdFor(ownerEmail: string): string {
  return `current:${ownerEmail}`;
}
