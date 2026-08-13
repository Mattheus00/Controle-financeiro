import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#C8F542",
          borderRadius: 16,
          color: "#163020",
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        F
      </div>
    ),
    size,
  );
}
