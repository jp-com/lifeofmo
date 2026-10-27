"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import {
  booksellerErrors,
  booksellerSchema,
  type BooksellerErrors,
  type BooksellerField,
} from "../../lib/booksellers";
import styles from "./booksellers.module.css";

export function BooksellerForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<BooksellerErrors>({});
  const [error, setError] = useState("");
  const lastRequest = useRef<{ body: string; id: string } | null>(null);
  const success = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") success.current?.focus();
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = booksellerSchema.safeParse(Object.fromEntries(data));
    setError("");
    if (!result.success) {
      const fields = booksellerErrors(result.error);
      setErrors(fields);
      (form.elements.namedItem(Object.keys(fields)[0]) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    const body = JSON.stringify(result.data);
    if (lastRequest.current?.body !== body) {
      lastRequest.current = { body, id: crypto.randomUUID() };
    }
    try {
      const response = await fetch("/api/booksellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          requestId: lastRequest.current.id,
          website: data.get("website"),
        }),
      });
      const payload = await response.json() as { error?: string; fields?: BooksellerErrors };
      if (!response.ok) {
        setErrors(payload.fields ?? {});
        const first = Object.keys(payload.fields ?? {})[0];
        if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
        throw new Error(payload.error || "Your enquiry couldn’t be sent. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your enquiry couldn’t be sent. Please try again.");
      setStatus("error");
    }
  }

  const fieldProps = (field: BooksellerField) => ({
    "aria-invalid": errors[field] ? true as const : undefined,
    "aria-describedby": errors[field] ? `bookseller-${field}-error` : undefined,
    disabled: status === "sending",
  });
  const fieldError = (field: BooksellerField) => errors[field] ? (
    <p className="contact-field-error" id={`bookseller-${field}-error`}>{errors[field]}</p>
  ) : null;

  if (status === "success") return (
    <div ref={success} className={`contact-success ${styles.success}`} role="status" tabIndex={-1}>
      <Check size={28} aria-hidden="true" />
      <h2>Thank you for your interest.</h2>
      <p>Your bookseller enquiry has been received.</p>
      <a className="button" href="/#the-book">Back to the book</a>
    </div>
  );

  return (
    <form
      className={`contact-form ${styles.form}`}
      onSubmit={submit}
      noValidate
      aria-label="Bookseller enquiry"
      aria-busy={status === "sending"}
    >
      <div className={styles.formRow}>
        <div className="contact-field">
          <label htmlFor="bookseller-name">Your name</label>
          <input id="bookseller-name" name="name" autoComplete="name" maxLength={100} required {...fieldProps("name")} />
          {fieldError("name")}
        </div>
        <div className="contact-field">
          <label htmlFor="bookseller-bookshop">Bookshop name</label>
          <input id="bookseller-bookshop" name="bookshop" autoComplete="organization" maxLength={200} required {...fieldProps("bookshop")} />
          {fieldError("bookshop")}
        </div>
      </div>
      <div className={styles.formRow}>
        <div className="contact-field">
          <label htmlFor="bookseller-email">Email address</label>
          <input id="bookseller-email" name="email" type="email" autoComplete="email" maxLength={254} required {...fieldProps("email")} />
          {fieldError("email")}
        </div>
        <div className="contact-field">
          <label htmlFor="bookseller-location">Location</label>
          <input id="bookseller-location" name="location" placeholder="Town or city, country" maxLength={200} required {...fieldProps("location")} />
          {fieldError("location")}
        </div>
      </div>
      <div className="contact-field">
        <label htmlFor="bookseller-message">Your message</label>
        <textarea id="bookseller-message" name="message" rows={5} maxLength={5000} required {...fieldProps("message")} />
        {fieldError("message")}
      </div>
      <div className="honey" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="contact-submit">
        <button className="button" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>
        <p>Your details will only be used to respond to your enquiry.</p>
      </div>
      {status === "error" && error && <p className="contact-field-error" role="alert">{error}</p>}
    </form>
  );
}
