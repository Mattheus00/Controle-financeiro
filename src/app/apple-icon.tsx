import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#B7E34B",
          borderRadius: 40,
        }}
      >
        <svg width="100" height="116" viewBox="0 0 48 56" fill="none">
          <path
            d="M24 2.5C37.2 11.4 44.8 24.8 41.6 38.2C39.2 48.2 31.4 53.8 24 55.5C16.6 53.8 8.8 48.2 6.4 38.2C3.2 24.8 10.8 11.4 24 2.5Z"
            fill="#0F1F16"
          />
          <path
            d="M24 18.5V47"
            stroke="#B7E34B"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
