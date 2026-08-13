"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PRICING_FAQ_ANSWER } from "@/lib/config";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    q: "O Folio é gratuito?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "Posso usar pelo celular?",
    a: "Sim. O Folio funciona em smartphones, tablets e computadores — a mesma conta, sem app extra obrigatório.",
  },
  {
    q: "Posso fotografar notas e comprovantes?",
    a: "Sim. O Folio analisa o comprovante e sugere informações para o registro da despesa.",
  },
  {
    q: "O gasto é cadastrado automaticamente?",
    a: "Não. O Folio apresenta os dados identificados para você revisar e confirmar.",
  },
  {
    q: "O Folio acessa minha conta bancária?",
    a: "Na versão inicial, não. Os dados são cadastrados por você — digitando ou fotografando um comprovante.",
  },
  {
    q: "Meus comprovantes ficam públicos?",
    a: "Não. Os comprovantes são armazenados de forma privada, ligados à sua conta.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-medium text-muted-foreground">FAQ</p>
          <h2 className="mt-3 font-display text-[2rem] leading-[1.12] tracking-tight md:text-5xl">
            Perguntas diretas. Respostas curtas.
          </h2>
        </div>
        <div className="divide-y divide-border rounded-[2rem] bg-card ring-1 ring-border">
          {QUESTIONS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q} className="px-5">
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={cn("size-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
