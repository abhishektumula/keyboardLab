// MacBook-style ANSI layout. Widths are in key units, so every row adds up to 15.
// Codes are KeyboardEvent.code values, which name the physical key, not the character.

export type IconId =
  | "brightness-down"
  | "brightness-up"
  | "mission-control"
  | "launchpad"
  | "dictation"
  | "moon"
  | "prev"
  | "play"
  | "next"
  | "mute"
  | "volume-down"
  | "volume-up"
  | "power"
  | "globe"
  | "up"
  | "down"
  | "left"
  | "right";

export interface KeySpec {
  code: string;
  name: string; // shown in the big readout
  w: number;
  top?: string; // legend above (shifted character or symbol)
  bottom?: string; // main legend
  align?: "left" | "right" | "center";
  small?: boolean; // smaller legend text, for words like "command"
  icon?: IconId;
  fn?: string; // F-key label
  symbol?: string; // used when pressed as part of a chord, e.g. ⌘
  modifier?: boolean;
  midi?: number; // note played in synth mode, if any
  led?: boolean; // has an indicator light (caps lock)
}

export type Spacer = { spacer: true };
export type Stack = { stack: (KeySpec | Spacer)[] };
export type Cell = KeySpec | Stack;
export interface Row {
  h: number; // row height in key units
  cells: Cell[];
}

// Major pentatonic across the rows, so any key you hit sounds fine with any other.
const DEGREES = [0, 2, 4, 7, 9];
const pentatonic = (col: number) =>
  12 * Math.floor(col / 5) + DEGREES[((col % 5) + 5) % 5];

// Lowest row is the lowest octave; each row up starts higher.
const ROW_BASE = { bottom: 48, home: 55, top: 60, digits: 67 };

const note = (row: keyof typeof ROW_BASE, col: number) => ROW_BASE[row] + pentatonic(col);

function key(code: string, name: string, w: number, rest: Partial<KeySpec> = {}): KeySpec {
  return { code, name, w, align: "center", ...rest };
}

function letters(row: keyof typeof ROW_BASE, chars: string): KeySpec[] {
  return [...chars].map((c, i) =>
    key(`Key${c}`, c, 1, { bottom: c, midi: note(row, i) }),
  );
}

function pair(
  row: keyof typeof ROW_BASE,
  col: number,
  code: string,
  top: string,
  bottom: string,
  w = 1,
): KeySpec {
  return key(code, bottom, w, { top, bottom, midi: note(row, col) });
}

const FUNCTION_ROW: Cell[] = [
  key("Escape", "Esc", 1.5, { bottom: "esc", align: "left", small: true }),
  key("F1", "F1", 1, { icon: "brightness-down", fn: "F1" }),
  key("F2", "F2", 1, { icon: "brightness-up", fn: "F2" }),
  key("F3", "F3", 1, { icon: "mission-control", fn: "F3" }),
  key("F4", "F4", 1, { icon: "launchpad", fn: "F4" }),
  key("F5", "F5", 1, { icon: "dictation", fn: "F5" }),
  key("F6", "F6", 1, { icon: "moon", fn: "F6" }),
  key("F7", "F7", 1, { icon: "prev", fn: "F7" }),
  key("F8", "F8", 1, { icon: "play", fn: "F8" }),
  key("F9", "F9", 1, { icon: "next", fn: "F9" }),
  key("F10", "F10", 1, { icon: "mute", fn: "F10" }),
  key("F11", "F11", 1, { icon: "volume-down", fn: "F11" }),
  key("F12", "F12", 1, { icon: "volume-up", fn: "F12" }),
  key("Power", "Power", 1.5, { icon: "power" }),
];

const NUMBER_ROW: Cell[] = [
  pair("digits", -1, "Backquote", "~", "`"),
  pair("digits", 0, "Digit1", "!", "1"),
  pair("digits", 1, "Digit2", "@", "2"),
  pair("digits", 2, "Digit3", "#", "3"),
  pair("digits", 3, "Digit4", "$", "4"),
  pair("digits", 4, "Digit5", "%", "5"),
  pair("digits", 5, "Digit6", "^", "6"),
  pair("digits", 6, "Digit7", "&", "7"),
  pair("digits", 7, "Digit8", "*", "8"),
  pair("digits", 8, "Digit9", "(", "9"),
  pair("digits", 9, "Digit0", ")", "0"),
  pair("digits", 10, "Minus", "_", "-"),
  pair("digits", 11, "Equal", "+", "="),
  key("Backspace", "Delete", 2, { bottom: "delete", align: "right", small: true }),
];

const TOP_ROW: Cell[] = [
  key("Tab", "Tab", 1.5, { bottom: "tab", align: "left", small: true }),
  ...letters("top", "QWERTYUIOP"),
  pair("top", 10, "BracketLeft", "{", "["),
  pair("top", 11, "BracketRight", "}", "]"),
  pair("top", 12, "Backslash", "|", "\\", 1.5),
];

const HOME_ROW: Cell[] = [
  key("CapsLock", "Caps lock", 1.75, { bottom: "caps lock", align: "left", small: true, led: true }),
  ...letters("home", "ASDFGHJKL"),
  pair("home", 9, "Semicolon", ":", ";"),
  pair("home", 10, "Quote", '"', "'"),
  key("Enter", "Return", 2.25, { bottom: "return", align: "right", small: true }),
];

const BOTTOM_ROW: Cell[] = [
  key("ShiftLeft", "Shift", 2.25, {
    bottom: "shift",
    align: "left",
    small: true,
    modifier: true,
    symbol: "⇧",
  }),
  ...letters("bottom", "ZXCVBNM"),
  pair("bottom", 7, "Comma", "<", ","),
  pair("bottom", 8, "Period", ">", "."),
  pair("bottom", 9, "Slash", "?", "/"),
  key("ShiftRight", "Shift", 2.75, {
    bottom: "shift",
    align: "right",
    small: true,
    modifier: true,
    symbol: "⇧",
  }),
];

const SPACE_ROW: Cell[] = [
  key("Fn", "Fn", 1, { bottom: "fn", icon: "globe", align: "left", small: true }),
  key("ControlLeft", "Control", 1, {
    top: "⌃",
    bottom: "control",
    align: "left",
    small: true,
    modifier: true,
    symbol: "⌃",
  }),
  key("AltLeft", "Option", 1.25, {
    top: "⌥",
    bottom: "option",
    align: "left",
    small: true,
    modifier: true,
    symbol: "⌥",
  }),
  key("MetaLeft", "Command", 1.25, {
    top: "⌘",
    bottom: "command",
    align: "left",
    small: true,
    modifier: true,
    symbol: "⌘",
  }),
  key("Space", "Space", 5, {}),
  key("MetaRight", "Command", 1.25, {
    top: "⌘",
    bottom: "command",
    align: "left",
    small: true,
    modifier: true,
    symbol: "⌘",
  }),
  key("AltRight", "Option", 1.25, {
    top: "⌥",
    bottom: "option",
    align: "left",
    small: true,
    modifier: true,
    symbol: "⌥",
  }),
  // MacBook arrows are all half height: left and right sit low, up and down stack.
  { stack: [{ spacer: true }, key("ArrowLeft", "Left arrow", 1, { icon: "left" })] },
  { stack: [key("ArrowUp", "Up arrow", 1, { icon: "up" }), key("ArrowDown", "Down arrow", 1, { icon: "down" })] },
  { stack: [{ spacer: true }, key("ArrowRight", "Right arrow", 1, { icon: "right" })] },
];

export const ROWS: Row[] = [
  { h: 0.62, cells: FUNCTION_ROW },
  { h: 1, cells: NUMBER_ROW },
  { h: 1, cells: TOP_ROW },
  { h: 1, cells: HOME_ROW },
  { h: 1, cells: BOTTOM_ROW },
  { h: 1, cells: SPACE_ROW },
];

export const isStack = (cell: Cell): cell is Stack => "stack" in cell;

function flatten(): KeySpec[] {
  const out: KeySpec[] = [];
  for (const row of ROWS) {
    for (const cell of row.cells) {
      if (isStack(cell)) {
        for (const item of cell.stack) if (!("spacer" in item)) out.push(item);
      } else {
        out.push(cell);
      }
    }
  }
  return out;
}

export const KEYS = flatten();
export const KEY_BY_CODE: Record<string, KeySpec> = Object.fromEntries(KEYS.map((k) => [k.code, k]));

const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
export const noteName = (midi: number) => `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
export const midiToHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
