import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptPromise;

function loadScript() {
  if (typeof window !== "undefined" && window.turnstile) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

function getTheme() {
  if (typeof document === "undefined") return "dark";
  const raw = document.documentElement.getAttribute("data-theme");
  return raw === "light" ? "light" : "dark";
}

export default function TurnstileWidget({ siteKey, onVerify, onExpire, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError };
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    if (typeof document === "undefined") return () => {};
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!siteKey) {
      callbacksRef.current.onError?.();
      return () => {};
    }

    loadScript()
      .then(() => {
        if (!isMounted || !window.turnstile || !containerRef.current) return;
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => callbacksRef.current.onVerify?.(token),
          "expired-callback": () => callbacksRef.current.onExpire?.(),
          "error-callback": () => callbacksRef.current.onError?.(),
        });
      })
      .catch(() => callbacksRef.current.onError?.());

    return () => {
      isMounted = false;
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme]);

  return (
    <div
      data-testid="turnstile-container"
      ref={containerRef}
      style={{ minHeight: 65 }}
    />
  );
}
