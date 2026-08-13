import { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F9FAF3",
    theme_color: "#B7E34B",
    lang: "pt-BR",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
    ],
  };
}
