"use client";

export function BackToTop() {
  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
    >
      Back to top
      <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden="true">
        <path d="M4.5 10V1.5M1 5l3.5-3.5L8 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  );
}
