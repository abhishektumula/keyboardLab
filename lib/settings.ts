// Preferences live as data attributes on <html>, so CSS can theme the whole page from them
// and a tiny inline script can restore them before first paint (no flash of the wrong theme).

export interface Settings {
  theme: "light" | "dark";
  kb: "white" | "black";
  backlight: "on" | "off";
  sound: "on" | "off";
  mode: "synth" | "click";
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  kb: "black",
  backlight: "on",
  sound: "on",
  mode: "synth",
};

export const DEFAULT_LEVEL = 80; // backlight brightness, percent
export const MIN_LEVEL = 10;

const STORAGE_KEY = "keyboardlab:settings";

// Runs in <head> before the page paints.
export const RESTORE_SCRIPT = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})||"{}"),d=document.documentElement;${JSON.stringify(
  Object.keys(DEFAULT_SETTINGS),
)}.forEach(function(k){if(typeof s[k]==="string")d.dataset[k]=s[k]});if(typeof s.level==="number")d.style.setProperty("--bl",String(s.level/100))}catch(e){}`;

export function getSettings(): Settings {
  const d = document.documentElement.dataset;
  return {
    theme: d.theme === "light" ? "light" : "dark",
    kb: d.kb === "white" ? "white" : "black",
    backlight: d.backlight === "off" ? "off" : "on",
    sound: d.sound === "off" ? "off" : "on",
    mode: d.mode === "click" ? "click" : "synth",
  };
}

// Brightness lives in a CSS variable (0 to 1) that the backlight styles multiply by.
export function getLevel(): number {
  const bl = parseFloat(document.documentElement.style.getPropertyValue("--bl"));
  return Number.isFinite(bl) ? Math.round(bl * 100) : DEFAULT_LEVEL;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getSettings(), level: getLevel() }));
  } catch {
    // Storage can be blocked; the setting just won't persist.
  }
}

export function setLevel(level: number) {
  const clamped = Math.min(100, Math.max(MIN_LEVEL, Math.round(level)));
  document.documentElement.style.setProperty("--bl", String(clamped / 100));
  save();
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  document.documentElement.dataset[key] = value;
  save();
}

export function toggleSetting(key: keyof Settings) {
  const current = getSettings();
  const options: Record<keyof Settings, [string, string]> = {
    theme: ["light", "dark"],
    kb: ["white", "black"],
    backlight: ["on", "off"],
    sound: ["on", "off"],
    mode: ["synth", "click"],
  };
  const [a, b] = options[key];
  setSetting(key, (current[key] === a ? b : a) as never);
}
