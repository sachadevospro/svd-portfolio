"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      className="copy-email"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setState("copied");
        } catch {
          setState("failed");
        }
        window.setTimeout(() => setState("idle"), 2400);
      }}
    >
      <span aria-live="polite">{state === "copied" ? "Email copied" : state === "failed" ? "Copy not available" : "Copy email"}</span>
    </button>
  );
}
