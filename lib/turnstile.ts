import "server-only";

// Cloudflare Turnstile bot check on sign-up and checkout (feature 32). The
// check runs only when both keys are set. Without them (local development,
// browser tests) forms work as before; on the live site that is logged.
// Never log the secret or a token.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5000;
// Cloudflare tokens are at most 2048 characters.
const MAX_TOKEN_LENGTH = 2048;
const UNKNOWN_CLIENT = "unknown";

// The form field the widget fills with its token.
export const TURNSTILE_FIELD = "cf-turnstile-response";

export interface TurnstileConfig {
  siteKey: string;
  secretKey: string;
}

export type TurnstileResult = "ok" | "failed" | "off";

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

// null when the check is off. Only one key set is logged by name and treated
// as off, so a half-done setup never blocks real customers.
export function turnstileConfig(): TurnstileConfig | null {
  const siteKey = env("TURNSTILE_SITE_KEY");
  const secretKey = env("TURNSTILE_SECRET_KEY");
  if (siteKey && secretKey) return { siteKey, secretKey };
  if (siteKey || secretKey) {
    const missing = siteKey ? "TURNSTILE_SECRET_KEY" : "TURNSTILE_SITE_KEY";
    console.error(`Turnstile is off: ${missing} is not set`);
  }
  return null;
}

// The public key pages render the widget with, or null when the check is off.
export function turnstileSiteKey(): string | null {
  return turnstileConfig()?.siteKey ?? null;
}

// Verifies a widget token with Cloudflare. Only missing configuration lets a
// request through unchecked; any verification error fails closed.
export async function verifyTurnstile(
  token: FormDataEntryValue | null,
  client: string,
): Promise<TurnstileResult> {
  const config = turnstileConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") {
      console.error("Turnstile is off: keys are not set");
    }
    return "off";
  }
  if (typeof token !== "string" || !token || token.length > MAX_TOKEN_LENGTH) {
    return "failed";
  }

  const body = new URLSearchParams({ secret: config.secretKey, response: token });
  if (client !== UNKNOWN_CLIENT) body.set("remoteip", client);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error("Turnstile verify failed: status", response.status);
      return "failed";
    }
    const result = (await response.json()) as {
      success?: unknown;
      "error-codes"?: unknown;
    };
    if (result.success === true) return "ok";
    const codes = Array.isArray(result["error-codes"])
      ? result["error-codes"].filter((code) => typeof code === "string").join(",")
      : "";
    console.error("Turnstile check rejected:", codes || "no error codes");
    return "failed";
  } catch (error) {
    console.error(
      "Turnstile verify failed:",
      error instanceof Error ? error.name : "unknown error",
    );
    return "failed";
  }
}
