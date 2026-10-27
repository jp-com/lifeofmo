"use client";
import { useEffect, useRef, useState } from "react";

export function useCheckoutGift(email: string, recoverEmail: (email: string) => void) {
  const [result, setResult] = useState<{ email?: string; eligible: boolean } | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const recovered = useRef(false);
  const normalized = email.trim().toLowerCase();
  useEffect(() => {
    if (!normalized && recovered.current) return;
    if (normalized && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setErrorEmail(null);
      try {
        recovered.current = true;
        const url = new URL(location.href);
        const rawToken = url.searchParams.get("gift");
        const token = rawToken && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawToken) ? rawToken : null;
        const response = await fetch("/api/gifts/eligibility", {
          method: "POST", signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...(normalized ? { email: normalized } : {}), ...(!normalized && token ? { token } : {}) }),
        });
        if (!response.ok) throw new Error("Gift check failed");
        const data = await response.json() as { email?: string; eligible: boolean };
        if (controller.signal.aborted) return;
        setResult(data);
        if (!normalized && data.email) recoverEmail(data.email);
        if (rawToken) {
          url.searchParams.delete("gift");
          history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
        }
      } catch { if (!controller.signal.aborted) { recovered.current = false; setErrorEmail(normalized); } }
    }, normalized ? 350 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [normalized, recoverEmail, attempt]);
  return { eligible: Boolean(normalized && result?.email === normalized && result.eligible), error: errorEmail !== null && errorEmail === normalized, retry: () => setAttempt((value) => value + 1) };
}
