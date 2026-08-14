"use client";

import { createContext, useContext } from "react";
import { creditCardLabel } from "@/features/cards/card-label";

export type CreditCardOption = {
  id: string;
  name: string;
  brand: string | null;
  last_four: string | null;
};

const CreditCardsContext = createContext<CreditCardOption[]>([]);

export function CreditCardsProvider({
  cards,
  children,
}: {
  cards: CreditCardOption[];
  children: React.ReactNode;
}) {
  return <CreditCardsContext.Provider value={cards}>{children}</CreditCardsContext.Provider>;
}

export function useCreditCards() {
  return useContext(CreditCardsContext);
}

export { creditCardLabel };
