import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as icons from "simple-icons";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "brands");
mkdirSync(dir, { recursive: true });

const map = {
  netflix: "siNetflix",
  spotify: "siSpotify",
  uber: "siUber",
  "99": "si99",
  ifood: "siIfood",
  amazon: "siAmazon",
  "mercado-livre": "siMercadolibre",
  nubank: "siNubank",
  inter: "siBancointer",
  picpay: "siPicpay",
  "mercado-pago": "siMercadopago",
  claro: "siClaro",
  vivo: "siVivo",
  tim: "siTim",
  google: "siGoogle",
  apple: "siApple",
  microsoft: "siMicrosoft",
  steam: "siSteam",
  playstation: "siPlaystation",
  xbox: "siXbox",
  youtube: "siYoutube",
  "disney-plus": "siDisneyplus",
  "prime-video": "siPrimevideo",
  max: "siMax",
  shopee: "siShopee",
  shein: "siShein",
  mcdonalds: "siMcdonalds",
  "burger-king": "siBurgerking",
  starbucks: "siStarbucks",
  carrefour: "siCarrefour",
  openai: "siOpenai",
  icloud: "siIcloud",
  magalu: "siMagazineluiiza",
  itau: "siItau",
  bradesco: "siBradesco",
  rappi: "siRappi",
  shell: "siShell",
  petrobras: "siPetrobras",
};

let written = 0;
for (const [slug, key] of Object.entries(map)) {
  const icon = icons[key];
  if (!icon?.path) {
    console.warn("skip", slug, key);
    continue;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path fill="currentColor" d="${icon.path}"/></svg>\n`;
  writeFileSync(join(dir, `${slug}.svg`), svg);
  written += 1;
}
console.log(`wrote ${written} brand svgs`);
