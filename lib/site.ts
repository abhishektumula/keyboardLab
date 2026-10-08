// The one place the site's name, copy and address are defined. Set NEXT_PUBLIC_SITE_URL to the
// deployed address so canonical links, the sitemap and social previews point at the right place.
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const SITE_URL = (fromEnv ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE = {
  name: "keyboardLab",
  title: "keyboardLab: a full-screen Mac keyboard you can play",
  description:
    "A full-screen, backlit Mac keyboard in your browser. Press keys to see them light up and hear them, with light and dark themes and adjustable backlight.",
  keywords: [
    "Mac keyboard",
    "virtual keyboard",
    "keyboard visualizer",
    "key press visualizer",
    "keyboard sounds",
    "backlit keyboard",
    "typing sounds",
    "Web Audio",
    "interactive",
    "Next.js",
  ],
  themeColor: "#050506",
};
