import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { turnstileConfig, turnstileSiteKey, verifyTurnstile } from "@/lib/turnstile";

const fetchMock = vi.fn();
const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function setKeys(site = "site_key_1", secret = "secret_key_1") {
  vi.stubEnv("TURNSTILE_SITE_KEY", site);
  vi.stubEnv("TURNSTILE_SECRET_KEY", secret);
}

function sentBody(): URLSearchParams {
  return fetchMock.mock.calls[0][1].body as URLSearchParams;
}

function logged(): string {
  return errorLog.mock.calls.flat().join(" ");
}

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(reply({ success: true }));
  vi.stubGlobal("fetch", fetchMock);
  errorLog.mockClear();
  setKeys();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("turnstileConfig", () => {
  it("reads both keys", () => {
    setKeys(" site_key_1 ", "secret_key_1");
    expect(turnstileConfig()).toEqual({ siteKey: "site_key_1", secretKey: "secret_key_1" });
    expect(turnstileSiteKey()).toBe("site_key_1");
  });

  it("is off when neither key is set, without logging", () => {
    setKeys("", "");
    expect(turnstileConfig()).toBeNull();
    expect(turnstileSiteKey()).toBeNull();
    expect(errorLog).not.toHaveBeenCalled();
  });

  it.each([
    ["TURNSTILE_SECRET_KEY", "site_key_1", ""],
    ["TURNSTILE_SITE_KEY", "", "secret_key_1"],
  ])("is off and names %s when only one key is set", (missing, site, secret) => {
    setKeys(site, secret);
    expect(turnstileConfig()).toBeNull();
    expect(logged()).toContain(missing);
    expect(logged()).not.toContain("key_1");
  });
});

describe("verifyTurnstile", () => {
  it("is off without keys and never calls Cloudflare", async () => {
    setKeys("", "");
    expect(await verifyTurnstile("token", "203.0.113.7")).toBe("off");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs that the check is off in production", async () => {
    setKeys("", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(await verifyTurnstile("token", "ip")).toBe("off");
    expect(logged()).toContain("Turnstile is off");
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["a file", new File(["x"], "x.txt")],
    ["too long", "t".repeat(2049)],
  ])("fails a %s token without calling Cloudflare", async (_label, token) => {
    expect(await verifyTurnstile(token, "ip")).toBe("failed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("passes when Cloudflare confirms the token", async () => {
    expect(await verifyTurnstile("token_abc", "203.0.113.7")).toBe("ok");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init.method).toBe("POST");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(sentBody().get("secret")).toBe("secret_key_1");
    expect(sentBody().get("response")).toBe("token_abc");
    expect(sentBody().get("remoteip")).toBe("203.0.113.7");
  });

  it("sends no remoteip for an unknown client", async () => {
    await verifyTurnstile("token_abc", "unknown");
    expect(sentBody().has("remoteip")).toBe(false);
  });

  it("fails when Cloudflare rejects the token, logging only the codes", async () => {
    fetchMock.mockResolvedValue(
      reply({ success: false, "error-codes": ["invalid-input-response"] }),
    );
    expect(await verifyTurnstile("token_abc", "ip")).toBe("failed");
    expect(logged()).toContain("invalid-input-response");
    expect(logged()).not.toContain("token_abc");
    expect(logged()).not.toContain("secret_key_1");
  });

  it("fails on a non-2xx status", async () => {
    fetchMock.mockResolvedValue(reply({ success: true }, 500));
    expect(await verifyTurnstile("token_abc", "ip")).toBe("failed");
  });

  it("fails on a body that is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>", { status: 200 }));
    expect(await verifyTurnstile("token_abc", "ip")).toBe("failed");
  });

  it("fails on a network error or timeout", async () => {
    fetchMock.mockRejectedValue(new DOMException("timed out", "TimeoutError"));
    expect(await verifyTurnstile("token_abc", "ip")).toBe("failed");
    expect(logged()).toContain("TimeoutError");
  });
});
