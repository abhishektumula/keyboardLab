import {
  IconBrightnessDown,
  IconBrightnessUp,
  IconCaretDownFilled,
  IconCaretLeftFilled,
  IconCaretRightFilled,
  IconCaretUpFilled,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconMicrophone,
  IconMoon,
  IconPlayerPlay,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconPower,
  IconVolume,
  IconVolume2,
  IconVolumeOff,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import { memo, type CSSProperties } from "react";
import { ROWS, isStack, type IconId, type KeySpec } from "@/lib/layout";

const ICONS: Record<IconId, Icon> = {
  "brightness-down": IconBrightnessDown,
  "brightness-up": IconBrightnessUp,
  "mission-control": IconLayoutDashboard,
  launchpad: IconLayoutGrid,
  dictation: IconMicrophone,
  moon: IconMoon,
  prev: IconPlayerTrackPrev,
  play: IconPlayerPlay,
  next: IconPlayerTrackNext,
  mute: IconVolumeOff,
  "volume-down": IconVolume2,
  "volume-up": IconVolume,
  power: IconPower,
  globe: IconWorld,
  up: IconCaretUpFilled,
  down: IconCaretDownFilled,
  left: IconCaretLeftFilled,
  right: IconCaretRightFilled,
};

// A key spanning n units is n cells plus the gaps between them.
const span = (n: number) => `calc(${n} * var(--u) + ${Math.max(0, n - 1)} * var(--gap))`;

function kind(spec: KeySpec) {
  if (spec.fn) return "fn";
  if (spec.code.startsWith("Arrow") || spec.code === "Power") return "icon";
  if (spec.code.startsWith("Key")) return "letter";
  if (spec.top && !spec.modifier) return "pair";
  return "word";
}

interface KeyProps {
  spec: KeySpec;
  pressed: boolean;
  capsOn: boolean;
  stacked?: boolean;
  height?: string;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

const Key = memo(function Key({ spec, pressed, capsOn, stacked, height, onPress, onRelease }: KeyProps) {
  const Glyph = spec.icon ? ICONS[spec.icon] : null;
  const style: CSSProperties = stacked ? { flex: 1, width: "100%" } : { width: span(spec.w), height };

  return (
    <div
      className="key"
      style={style}
      data-code={spec.code}
      data-kind={kind(spec)}
      data-align={spec.align}
      data-pressed={pressed}
      data-modifier={spec.modifier ? "" : undefined}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(spec.code);
      }}
      onPointerUp={() => onRelease(spec.code)}
      onPointerLeave={() => onRelease(spec.code)}
      onPointerCancel={() => onRelease(spec.code)}
    >
      {spec.led && <span className="led" data-on={capsOn} />}
      {spec.fn ? (
        <>
          {Glyph && <Glyph className="legend-icon" stroke={1.6} />}
          <span className="legend small">{spec.fn}</span>
        </>
      ) : kind(spec) === "icon" && Glyph ? (
        <Glyph className="legend-icon" stroke={1.6} />
      ) : (
        <>
          {spec.top && <span className="legend legend-top">{spec.top}</span>}
          {Glyph && <Glyph className="legend-icon legend-corner" stroke={1.6} />}
          {spec.bottom && <span className={`legend ${spec.small ? "small" : ""}`}>{spec.bottom}</span>}
        </>
      )}
    </div>
  );
});

interface KeyboardProps {
  pressed: ReadonlySet<string>;
  capsOn: boolean;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
}

export default function Keyboard({ pressed, capsOn, onPress, onRelease }: KeyboardProps) {
  return (
    <div className="kb" style={{ width: "min(96vw, calc((100dvh - 15rem) * 2.55))" }}>
      <div className="kb-deck">
        {ROWS.map((row, r) => {
          const height = row.h >= 1 ? span(row.h) : `calc(${row.h} * var(--u))`;
          return (
            <div key={r} className="kb-row" style={{ height }}>
              {row.cells.map((cell, c) =>
                isStack(cell) ? (
                  <div key={c} className="kb-stack" style={{ width: span(1) }}>
                    {cell.stack.map((item, i) =>
                      "spacer" in item ? (
                        <div key={i} style={{ flex: 1 }} />
                      ) : (
                        <Key
                          key={item.code}
                          spec={item}
                          stacked
                          pressed={pressed.has(item.code)}
                          capsOn={capsOn}
                          onPress={onPress}
                          onRelease={onRelease}
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <Key
                    key={cell.code}
                    spec={cell}
                    height={height}
                    pressed={pressed.has(cell.code)}
                    capsOn={capsOn}
                    onPress={onPress}
                    onRelease={onRelease}
                  />
                ),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
