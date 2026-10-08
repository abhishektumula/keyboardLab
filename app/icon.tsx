import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "#050506",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "#1b1b1e",
            border: "1.5px solid rgba(255,246,228,0.8)",
            color: "white",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          K
        </div>
      </div>
    ),
    size,
  );
}
