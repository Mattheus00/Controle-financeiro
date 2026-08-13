import { LandingPage } from "@/features/landing/landing-page";
import { APP_DESCRIPTION, LANDING_TITLE } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: LANDING_TITLE,
  description: APP_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <LandingPage />;
}
