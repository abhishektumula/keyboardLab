import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}: a backlit Mac keyboard with a few keys lit up`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const KEY = 54;
const GAP = 7;

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const PRESSED = new Set(["K", "E", "Y"]);

function Cap({ label, width = KEY }: { label?: string; width?: number }) {
  const pressed = label !== undefined && PRESSED.has(label);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height: KEY,
        borderRadius: 11,
        color: "white",
        fontSize: 24,
        fontWeight: 600,
        background: pressed ? "#1d6fd6" : "linear-gradient(180deg, #2b2b2f, #1b1b1e)",
        border: pressed ? "2px solid #0a84ff" : "2px solid rgba(255,246,228,0.55)",
        boxShadow: pressed
          ? "0 0 34px rgba(10,132,255,0.8)"
          : "0 0 22px rgba(255,246,228,0.22), 0 4px 0 #050506",
      }}
    >
      {label}
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 72px 44px",
          background: "radial-gradient(ellipse at 50% 30%, #1d1d23 0%, #050506 75%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#8d8d96",
              fontWeight: 700,
            }}
          >
            Interactive lab
          </div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.05, marginTop: 6 }}>
            keyboardLab
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#b4b4bc", marginTop: 10 }}>
            A full-screen Mac keyboard you can play.
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: GAP,
              padding: 16,
              borderRadius: 24,
              background: "#111113",
              border: "2px solid rgba(255,255,255,0.08)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
            }}
          >
            {ROWS.map((row) => (
              <div key={row} style={{ display: "flex", gap: GAP }}>
                {[...row].map((letter) => (
                  <Cap key={letter} label={letter} />
                ))}
              </div>
            ))}
            <div style={{ display: "flex" }}>
              <Cap width={KEY * 6 + GAP * 5} />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
