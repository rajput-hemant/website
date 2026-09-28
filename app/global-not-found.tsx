import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not found" };

/**
 * Only for URLs outside every edition (the proxy sends page paths into one,
 * where that edition's own 404 renders), so it stays tiny and unstyled by
 * any flavor.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8f5ef",
          color: "#2b2622",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontWeight: 500 }}>Page not found</h1>
          <p>
            <a href="/" style={{ color: "inherit" }}>
              Go to the home page
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
