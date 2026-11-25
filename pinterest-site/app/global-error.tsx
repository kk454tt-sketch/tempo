"use client";

// Last resort: only renders when the root layout itself fails, so it cannot
// use the site's fonts or components. Styles are inline for that reason.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Something went wrong</h1>
            <button
              type="button"
              onClick={() => reset()}
              style={{ height: 48, padding: "0 24px", borderRadius: 16, border: 0, background: "#f59e0b", color: "#0f172a", fontWeight: 600, cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
