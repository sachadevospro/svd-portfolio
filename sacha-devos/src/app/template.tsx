"use client";

import { useState } from "react";

let hasMounted = false;

/**
 * Wraps every page. After the first page load, each navigation fades the
 * new page in (see .page-enter in globals.css).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => {
    if (typeof window === "undefined") return false;
    const value = hasMounted;
    hasMounted = true;
    return value;
  });
  return <div className={`page-enter${animate ? " is-animated" : ""}`}>{children}</div>;
}
