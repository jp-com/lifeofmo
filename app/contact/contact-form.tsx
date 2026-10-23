"use client";

import { useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { contactSchema, contactErrors, enquiryTypes, type ContactErrors, type ContactField } from "../../lib/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = contactSchema.safeParse(Object.fromEntries(data));
    if (!result.success) {
      const fields = contactErrors(result.error);
      setErrors(fields);
      const first = Object.keys(fields)[0];
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    setError("");
    setStatus("sending");
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, requestId: requestId.current, website: data.get("website") }),
      });
      const payload = await response.json() as { error?: string; fields?: ContactErrors };
      if (!response.ok) {
        setErrors(payload.fields ?? {});
        throw new Error(payload.error || "Your message couldn’t be sent. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your message couldn’t be sent. Please try again.");
      setStatus("error");
    }
  }

  const fieldProps = (field: ContactField) => ({
    "aria-invalid": errors[field] ? true as const : undefined,
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
  });
  const fieldError = (field: ContactField) => errors[field] ? (
    <p className="contact-field-error" id={`contact-${field}-error`}>{errors[field]}</p>
  ) : null;

  if (status === "success") return (
    <div className="contact-success" role="status" aria-live="polite">
      <Check size={28} aria-hidden="true" />
      <h2>Thank you for saying hello.</h2>
      <p>Your message has been received.</p>
      <a className="button" href="/#the-book">Back to the book</a>
    </div>
  );

  return (
    <form className="contact-form" onSubmit={submit} noValidate aria-label="Send us a message" aria-busy={status === "sending"}>
      <div className="contact-field">
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" name="name" autoComplete="name" maxLength={100} required {...fieldProps("name")} />
        {fieldError("name")}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-email">Email address</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required {...fieldProps("email")} />
        {fieldError("email")}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-topic">Enquiry type</label>
        <div className="contact-select">
          <select id="contact-topic" name="topic" defaultValue="" required {...fieldProps("topic")}>
            <option value="" disabled>Please choose</option>
            {enquiryTypes.map(topic => <option key={topic} value={topic}>{topic}</option>)}
          </select>
          <ChevronDown size={18} aria-hidden="true" />
        </div>
        {fieldError("topic")}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-message">Your message</label>
        <textarea id="contact-message" name="message" rows={5} maxLength={5000} required {...fieldProps("message")} />
        {fieldError("message")}
      </div>
      <div className="honey" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="contact-submit">
        <button className="button" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p>Your details will be used to respond to your enquiry.</p>
      </div>
      {status === "error" && <p className="contact-field-error" role="alert">{error}</p>}
    </form>
  );
}
