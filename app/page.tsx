import KeyboardLab from "@/components/KeyboardLab";
import { SITE, SITE_URL } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  description: SITE.description,
  url: SITE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript and a keyboard",
  inLanguage: "en",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* The keyboard is drawn from components, so this is the plain text that search engines and screen readers get. */}
      <div className="sr-only">
        <h1>{SITE.name}: a full-screen Mac keyboard you can play</h1>
        <p>{SITE.description}</p>
        <p>
          Press any key on your keyboard to see it light up on screen and hear it. Switch between musical notes
          and typing clicks, between light and dark themes, between a white and a black keyboard, and adjust the
          backlight brightness.
        </p>
      </div>
      <KeyboardLab />
    </>
  );
}
