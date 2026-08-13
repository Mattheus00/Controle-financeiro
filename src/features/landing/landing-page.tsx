import { Hero } from "@/features/landing/hero";
import { Benefits } from "@/features/landing/benefits";
import { ProblemSection } from "@/features/landing/problem-section";
import { ReceiptScannerSection } from "@/features/landing/receipt-scanner-section";
import { TransactionsShowcase } from "@/features/landing/transactions-showcase";
import { BillsSection } from "@/features/landing/bills-section";
import { SubscriptionsSection } from "@/features/landing/subscriptions-section";
import { DashboardShowcase } from "@/features/landing/dashboard-showcase";
import { ForecastSection } from "@/features/landing/forecast-section";
import { BudgetSection } from "@/features/landing/budget-section";
import { GoalsSection } from "@/features/landing/goals-section";
import { InsightsSection } from "@/features/landing/insights-section";
import { HowItWorks } from "@/features/landing/how-it-works";
import { BeforeAfter } from "@/features/landing/before-after";
import { SecuritySection } from "@/features/landing/security-section";
import { Faq } from "@/features/landing/faq";
import { FinalCta } from "@/features/landing/final-cta";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/config";

export function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: APP_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Benefits />
      <ProblemSection />
      <ReceiptScannerSection />
      <TransactionsShowcase />
      <BillsSection />
      <SubscriptionsSection />
      <DashboardShowcase />
      <ForecastSection />
      <BudgetSection />
      <GoalsSection />
      <InsightsSection />
      <HowItWorks />
      <BeforeAfter />
      <SecuritySection />
      <Faq />
      <FinalCta />
    </>
  );
}
