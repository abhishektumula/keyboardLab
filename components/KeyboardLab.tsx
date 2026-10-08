"use client";

import {
  IconBulb,
  IconBulbOff,
  IconHandClick,
  IconKeyboard,
  IconMaximize,
  IconMinimize,
  IconMoon,
  IconPiano,
  IconSun,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { getSound, releaseNote, silence, uiClick } from "@/lib/keySound";
import { KEYS, KEY_BY_CODE, midiToHz, noteName, type KeySpec } from "@/lib/layout";
import {
  DEFAULT_LEVEL,
  MIN_LEVEL,
  getLevel,
  getSettings,
  setLevel,
  setSetting,
  toggleSetting,
  type Settings,
} from "@/lib/settings";
import Keyboard from "./Keyboard";

interface Readout {
  id: number;
  main: string;
  sub: string;
}

// Big keys sound lower, like a real board.
const clickPitch = (spec: KeySpec) =>
  spec.code === "Space" ? 0.65 : spec.w >= 1.5 ? 0.85 : 1;

function describe(spec: KeySpec, held: ReadonlySet<string>): Omit<Readout, "id"> {
  const mode = getSettings().mode;
  const symbols = [...new Set(KEYS.filter((k) => k.modifier && held.has(k.code)).map((k) => k.symbol!))];
  const main =
    spec.modifier || symbols.length === 0
      ? `${spec.symbol ? `${spec.symbol} ` : ""}${spec.name}`
      : `${symbols.join(" ")} ${spec.name}`;
  const sub =
    mode === "synth" && spec.midi !== undefined
      ? `${noteName(spec.midi)} · ${midiToHz(spec.midi).toFixed(1)} Hz`
      : "click";
  return { main, sub };
}

interface ToolButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

function ToolButton({ label, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      title={label}
      aria-label={label}
      className="tool"
      onClick={(e) => {
        onClick();
        e.currentTarget.blur();
      }}
    >
      {children}
    </button>
  );
}

export default function KeyboardLab() {
  const pressedRef = useRef(new Set<string>());
  const readoutId = useRef(0);
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  const [capsOn, setCapsOn] = useState(false);
  const [readout, setReadout] = useState<Readout | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  const press = useCallback((code: string) => {
    const spec = KEY_BY_CODE[code];
    if (!spec || pressedRef.current.has(code)) return;
    pressedRef.current.add(code);
    setPressed(new Set(pressedRef.current));

    const sound = getSound();
    if (sound) {
      if (getSettings().mode === "synth" && spec.midi !== undefined) sound.noteOn(code, spec.midi);
      else sound.click(clickPitch(spec), spec.code === "Space" ? 1.1 : 1);
    }
    setReadout({ id: ++readoutId.current, ...describe(spec, pressedRef.current) });
  }, []);

  const release = useCallback((code: string) => {
    if (!pressedRef.current.delete(code)) return;
    setPressed(new Set(pressedRef.current));
    releaseNote(code);
  }, []);

  const releaseAll = useCallback(() => {
    pressedRef.current.clear();
    setPressed(new Set());
    silence();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const spec = KEY_BY_CODE[e.code];
      if (!spec) return;
      // Leave browser shortcuts such as Cmd+R alone, but still show the key.
      if (!((e.metaKey || e.ctrlKey) && !spec.modifier)) e.preventDefault();
      if (e.repeat) return;

      if (e.code === "CapsLock") {
        // Browsers report caps lock as a toggle, so treat each event as a tap.
        setCapsOn(e.getModifierState("CapsLock"));
        press(e.code);
        setTimeout(() => release(e.code), 140);
        return;
      }
      press(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!KEY_BY_CODE[e.code]) return;
      e.preventDefault();
      if (e.code === "CapsLock") {
        setCapsOn(e.getModifierState("CapsLock"));
        press(e.code);
        setTimeout(() => release(e.code), 140);
        return;
      }
      release(e.code);
      // macOS never sends key-up for keys pressed while Command is held.
      if (e.code === "MetaLeft" || e.code === "MetaRight") releaseAll();
    };

    const onFullscreen = () => setFullscreen(!!document.fullscreenElement);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [press, release, releaseAll]);

  const change = (key: keyof Settings) => {
    toggleSetting(key);
    // The click confirms the change, so it plays after the setting flips (and stays silent if muted).
    if (key === "theme" || key === "sound") uiClick();
  };

  // The slider is uncontrolled: it takes its saved value once, after the page restores settings.
  useEffect(() => {
    if (sliderRef.current) sliderRef.current.value = String(getLevel());
  }, []);

  const onPointerPress = (code: string) => {
    if (code === "CapsLock") setCapsOn((on) => !on);
    press(code);
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="font-mono text-sm tracking-[0.2em] text-[var(--muted)]">keyboardLab</span>
        <div className="flex gap-2">
          <ToolButton label="Theme: light / dark" onClick={() => change("theme")}>
            <IconSun className="t-light" size={20} />
            <IconMoon className="t-dark" size={20} />
          </ToolButton>
          <ToolButton label="Keyboard colour: white / black" onClick={() => change("kb")}>
            <IconKeyboard size={20} />
            <span className="swatch k-white" />
            <span className="swatch k-black" />
          </ToolButton>
          <div className="backlight-group">
            <ToolButton label="Backlight: on / off" onClick={() => change("backlight")}>
              <IconBulb className="b-on" size={20} />
              <IconBulbOff className="b-off" size={20} />
            </ToolButton>
            <input
              ref={sliderRef}
              type="range"
              className="slider"
              min={MIN_LEVEL}
              max={100}
              defaultValue={DEFAULT_LEVEL}
              tabIndex={-1}
              title="Backlight brightness"
              aria-label="Backlight brightness"
              onInput={(e) => {
                setLevel(Number(e.currentTarget.value));
                // Moving the slider is a request for light, so switch the backlight on.
                if (getSettings().backlight === "off") setSetting("backlight", "on");
              }}
              onPointerUp={(e) => e.currentTarget.blur()}
            />
          </div>
          <ToolButton label="Sound: notes / typing clicks" onClick={() => change("mode")}>
            <IconPiano className="m-synth" size={20} />
            <IconHandClick className="m-click" size={20} />
          </ToolButton>
          <ToolButton label="Sound: on / off" onClick={() => change("sound")}>
            <IconVolume className="s-on" size={20} />
            <IconVolumeOff className="s-off" size={20} />
          </ToolButton>
          <ToolButton
            label="Full screen"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void document.documentElement.requestFullscreen();
            }}
          >
            {fullscreen ? <IconMinimize size={20} /> : <IconMaximize size={20} />}
          </ToolButton>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 pb-8">
        <div className="readout" aria-live="polite">
          {readout ? (
            <div key={readout.id} className="readout-pop">
              <div className="readout-main">{readout.main}</div>
              <div className="readout-sub">{readout.sub}</div>
            </div>
          ) : (
            <div className="readout-idle">Press any key</div>
          )}
        </div>
        <Keyboard pressed={pressed} capsOn={capsOn} onPress={onPointerPress} onRelease={release} />
      </main>
    </div>
  );
}
