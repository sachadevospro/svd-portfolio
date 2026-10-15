"use client";

import { useEffect, useState } from "react";

/** The current year, kept up to date even if the site has not been rebuilt for a while. */
export function Year({ initial }: { initial: number }) {
  const [year, setYear] = useState(initial);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <>{year}</>;
}
