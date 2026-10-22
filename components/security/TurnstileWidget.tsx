"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n/config";

// The Cloudflare Turnstile bot check (feature 32). The widget adds a hidden
// "cf-turnstile-response" input inside its container, so the token is posted
// with the surrounding form and verified by the server action.

interface TurnstileRenderOptions {
  sitekey: string;
  language: string;
  callback: () => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  "timeout-callback": () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string | undefined;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileWidgetProps {
  siteKey: string;
  locale: Locale;
  // Changes after every failed submit: tokens work once, so a new one is needed.
  resetKey: unknown;
  // True once a token is ready, false when it expires, fails, or is reset.
  // The form keeps its submit disabled until then (finding F-50).
  onTokenChange: (ready: boolean) => void;
  // Cloudflare's script did not load, so no token will ever come.
  onUnavailable: () => void;
}

export function TurnstileWidget({
  siteKey,
  locale,
  resetKey,
  onTokenChange,
  onUnavailable,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // The latest handler, so a new function from the parent never re-renders
  // the widget.
  const onTokenChangeRef = useRef(onTokenChange);
  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  const renderWidget = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.turnstile || widgetIdRef.current) return;
    const notReady = () => onTokenChangeRef.current(false);
    widgetIdRef.current =
      window.turnstile.render(container, {
        sitekey: siteKey,
        language: locale,
        callback: () => onTokenChangeRef.current(true),
        "expired-callback": notReady,
        "error-callback": notReady,
        "timeout-callback": notReady,
      }) ?? null;
  }, [siteKey, locale]);

  // The script may already be loaded (another page rendered it first).
  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  useEffect(() => {
    if (resetKey && widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
      onTokenChangeRef.current(false);
    }
  }, [resetKey]);

  return (
    <>
      <Script src={SCRIPT_URL} onReady={renderWidget} onError={onUnavailable} />
      {/* Reserves the widget's height so the button below does not jump. */}
      <div ref={containerRef} className="min-h-16.25" />
    </>
  );
}
