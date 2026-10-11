"use client";

// Replaces the root layout when it fails, so it renders its own document and cannot
// rely on global styles.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div role="alert" style={{ maxWidth: 420, margin: "96px auto", padding: "0 16px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#52525b", fontSize: 14 }}>UShop hit an unexpected error. Please try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 16, minHeight: 44, padding: "0 24px", borderRadius: 12, border: 0, background: "#6B1FA8", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
