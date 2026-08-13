import { ImageResponse } from "next/og";
import { APP_SLOGAN, LANDING_TITLE } from "@/lib/config";

export const alt = LANDING_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F9FAF3",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#B7E34B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="40" viewBox="0 0 48 56">
              <path
                d="M24 2.5C37.2 11.4 44.8 24.8 41.6 38.2C39.2 48.2 31.4 53.8 24 55.5C16.6 53.8 8.8 48.2 6.4 38.2C3.2 24.8 10.8 11.4 24 2.5Z"
                fill="#0F1F16"
              />
            </svg>
          </div>
          <div style={{ fontSize: 36, color: "#0F1F16" }}>Folio</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              color: "#0F1F16",
              maxWidth: 900,
            }}
          >
            Entenda para onde seu dinheiro está indo.
          </div>
          <div style={{ fontSize: 28, color: "#5C6B61" }}>{APP_SLOGAN}</div>
        </div>
      </div>
    ),
    size,
  );
}
