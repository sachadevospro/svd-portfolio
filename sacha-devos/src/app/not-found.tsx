import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="not-found wrap">
      <p className="label label--quiet">Error 404</p>
      <h1 className="not-found__title">Out of frame.</h1>
      <p className="not-found__text">This page doesn&rsquo;t exist, or it has moved. The photographs are this way.</p>
      <p className="not-found__links">
        <Link href="/" className="button">
          Home
        </Link>
        <Link href="/work" className="link">
          See all series
        </Link>
      </p>
    </div>
  );
}
