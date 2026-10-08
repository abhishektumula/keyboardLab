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
          background: "#050506",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 124,
            height: 124,
            borderRadius: 30,
            background: "linear-gradient(180deg, #2b2b2f, #1b1b1e)",
            border: "5px solid rgba(255,246,228,0.8)",
            boxShadow: "0 0 40px rgba(255,246,228,0.35)",
            color: "white",
            fontSize: 80,
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
