"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Sends the message to the form service configured in content/site.yml
 * (`contact.formEndpoint`, e.g. Formspree). This component is only shown
 * when an endpoint is configured, so it never pretends to send anything.
 */
export function ContactForm({ endpoint, email }: { endpoint: string; email: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("_gotcha")) return; // spam bot
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail = body?.errors?.map((x: { message: string }) => x.message).join(" ") || "";
        throw new Error(detail);
      }
      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  }

  if (status === "sent") {
    return (
      <div className="form-done" role="status">
        <p className="form-done__title">Message sent.</p>
        <p>Thank you. I will reply to the email address you gave as soon as possible.</p>
        <button type="button" className="link" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="form__row">
        <div className="field">
          <label htmlFor="cf-name">Name</label>
          <input id="cf-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-type">Project</label>
        <select id="cf-type" name="project" defaultValue="Photography">
          <option>Photography</option>
          <option>Videography</option>
          <option>Photography and videography</option>
          <option>Collaboration</option>
          <option>Something else</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows={6} required placeholder="Dates, location, what you have in mind…" />
      </div>
      {/* Hidden from people; bots fill it in and are ignored. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="cf-gotcha">Leave this field empty</label>
        <input id="cf-gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form__actions">
        <button type="submit" className="button" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "error" && (
          <p className="form__error" role="alert">
            The message was not sent{error ? ` (${error})` : ""}. Check your connection and try again
            {email ? (
              <>
                , or write to <a href={`mailto:${email}`}>{email}</a>
              </>
            ) : null}
            .
          </p>
        )}
      </div>
    </form>
  );
}
