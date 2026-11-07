"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Copy, Gift, X } from "lucide-react";
import styles from "./gift-popup.module.css";

type Stage = "invitation" | "reveal" | "claimed";
const storageKey = "life-of-mo:gift:v1";
function remember(state: "dismissed" | "claimed") {
  try { localStorage.setItem(storageKey, state); } catch { /* Browser storage is optional. */ }
}

function GiftCard({ onClose, initialStage = "invitation" }: { onClose: (claimed: boolean) => void; initialStage?: Stage }) {
  const [stage, setStage] = useState<Stage>(initialStage);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");
  const [claimPath, setClaimPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [notice, setNotice] = useState<"terms" | "privacy" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const dialog = dialogRef.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    titleRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      mounted.current = false;
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected && previous !== document.body) previous.focus();
      else document.getElementById("activities-title")?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { titleRef.current?.focus(); }, [stage]);

  async function claimGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("saving");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/gifts/claim", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), marketingConsent: false, company: form.get("company") }),
      });
      const result = await response.json() as { error?: string; claimPath?: string };
      if (!response.ok || !result.claimPath) throw new Error(result.error || "We couldn’t save your gift. Please try again.");
      remember("claimed");
      if (mounted.current) { setClaimPath(result.claimPath); setStage("claimed"); setStatus("idle"); }
    } catch (err) {
      if (mounted.current) { setError(err instanceof Error ? err.message : "Please try again."); setStatus("error"); }
    } finally { submitting.current = false; }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(new URL(claimPath, location.origin).href);
      setCopied(true);
    } catch { setCopyFailed(true); }
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="mo-gift-title" aria-describedby="mo-gift-description"
      onCancel={(event) => { event.preventDefault(); onClose(stage === "claimed"); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(stage === "claimed");
      }}>
      <button className={styles.close} type="button" aria-label="Close gift popup" onClick={() => onClose(stage === "claimed")}><X size={20} aria-hidden="true" /></button>
      <div className={styles.card}>
        <div className={`${styles.art} ${stage !== "invitation" ? styles.productArt : ""}`} aria-hidden="true">
          <img className={`${styles.mo} ${stage !== "invitation" ? styles.artHidden : ""}`} src="/assets/mo-gift-invitation.webp" alt="" width={584} height={730} />
          <picture className={`${styles.pencils} ${stage === "invitation" ? styles.artHidden : ""}`}>
            <source media="(max-width: 650px)" srcSet="/assets/gift-pencils-landscape.webp" width={900} height={450} />
            <img src="/assets/gift-pencils-portrait.webp" alt="" width={720} height={1080} />
          </picture>
          <p className={styles.artCaption}>{stage === "invitation" ? "A little kindness, from Mo." : "For colourful little adventures."}</p>
        </div>
        <div className={styles.content} key={stage}>
          {stage === "invitation" ? <>
            <h2 id="mo-gift-title" ref={titleRef} tabIndex={-1}>Mo has a little<br />gift for you.</h2>
            <p id="mo-gift-description" className={styles.description}>A little extra with your first book order.</p>
            <button className={`button ${styles.primary}`} type="button" onClick={() => setStage("reveal")}><Gift size={18} aria-hidden="true" />Reveal my gift</button>
            <button className={styles.secondary} type="button" onClick={() => onClose(false)}>Maybe later</button>
          </> : stage === "reveal" ? <>
            <h2 id="mo-gift-title" ref={titleRef} tabIndex={-1}>A set of colouring<br />pencils, on Mo.</h2>
            <p id="mo-gift-description" className={styles.description}>Claim a free set with your first Life of Mo book order.</p>
            <form onSubmit={claimGift} className={styles.form}>
              <label htmlFor="gift-email">Your email address</label>
              <input id="gift-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} aria-describedby={`gift-notice gift-terms${status === "error" ? " gift-error" : ""}`} aria-invalid={status === "error" ? true : undefined} />
              <div className="honey" aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
              <p className={styles.notice} id="gift-notice">
                By claiming your gift, you agree to our <button type="button" aria-expanded={notice === "terms"} aria-controls="gift-offer-terms" onClick={() => setNotice(notice === "terms" ? null : "terms")}>gift terms</button> and acknowledge our <button type="button" aria-expanded={notice === "privacy"} aria-controls="gift-privacy-notice" onClick={() => setNotice(notice === "privacy" ? null : "privacy")}>privacy notice</button>.
              </p>
              <p className={styles.noticeDetails} id="gift-offer-terms" hidden={notice !== "terms"}>
                One set of colouring pencils with your first paid Life of Mo book order. Use the same email at checkout. Existing subscribers are welcome too.
              </p>
              <p className={styles.noticeDetails} id="gift-privacy-notice" hidden={notice !== "privacy"}>
                We save your email and claim date to add the gift to your first paid book order. A cookie remembers your claim, and browser storage remembers if you dismiss this popup. Claiming a gift does not subscribe you to marketing emails.
              </p>
              {error ? <p className={styles.error} id="gift-error" role="alert">{error}</p> : null}
              <button className={`button ${styles.primary}`} type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving your gift…" : "Claim my gift"}</button>
            </form>
            <p className={styles.terms} id="gift-terms">One set with your first paid book order.</p>
          </> : <>
            <span className={styles.successMark}><Check size={22} aria-hidden="true" /></span>
            <h2 id="mo-gift-title" ref={titleRef} tabIndex={-1}>Your gift is saved.</h2>
            <p id="mo-gift-description" className={styles.description}>We’ll include your free colouring pencils with your first book order. Just use the same email at checkout.</p>
            <button className={`button ${styles.primary}`} type="button" onClick={() => onClose(true)}>Explore the book</button>
            <button className={styles.copyLink} type="button" onClick={copyLink} disabled={!claimPath}><Copy size={14} aria-hidden="true" />{copied ? "Gift link copied" : "Copy my gift link"}</button>
            <span className="visually-hidden" role="status">{copied ? "Your gift link has been copied." : ""}</span>
            {copyFailed ? <label className={styles.backupLabel}>Your gift link<input readOnly value={typeof window === "undefined" ? claimPath : new URL(claimPath, location.origin).href} onFocus={(event) => event.currentTarget.select()} /></label> : null}
          </>}
        </div>
      </div>
    </dialog>
  );
}

export function GiftPopup() {
  const [open, setOpen] = useState(false);
  const [reached, setReached] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [previewStage, setPreviewStage] = useState<Stage>("invitation");
  const close = useCallback((wasClaimed: boolean) => {
    let savedClaim = wasClaimed;
    try { savedClaim ||= localStorage.getItem(storageKey) === "claimed"; } catch { /* Optional storage. */ }
    remember(savedClaim ? "claimed" : "dismissed");
    setClaimed(savedClaim);
    setOpen(false);
  }, []);

  useEffect(() => {
    // A local design preview never clears a customer's saved claim or dismissal.
    if (process.env.NODE_ENV === "development") {
      const preview = new URLSearchParams(location.search).get("gift-preview");
      if (preview === "1" || preview === "reveal" || preview === "claimed") {
        const frame = requestAnimationFrame(() => {
          setPreviewStage(preview === "1" ? "invitation" : preview);
          setReached(true); setOpen(true);
        });
        return () => cancelAnimationFrame(frame);
      }
    }
    let saved: string | null = null;
    try { saved = localStorage.getItem(storageKey); } catch { /* Optional storage. */ }
    if (saved === "claimed") return;
    const target = document.getElementById("activities-title");
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setReached(true);
      if (!saved && !document.querySelector("dialog[open]")) {
        remember("dismissed");
        setOpen(true);
      }
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return <>
    {reached && !claimed && !open ? <button className={styles.launcher} type="button" onClick={() => setOpen(true)}><Gift size={18} aria-hidden="true" />Mo’s gift</button> : null}
    {open ? <GiftCard onClose={close} initialStage={previewStage} /> : null}
  </>;
}
