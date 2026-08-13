import { FolderLock, ImageOff, KeyRound, Trash2 } from "lucide-react";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

const ITEMS = [
  {
    icon: FolderLock,
    title: "Dados privados",
    text: "Informações separadas por usuário. Cada conta vê só o que é dela.",
  },
  {
    icon: ImageOff,
    title: "Comprovantes protegidos",
    text: "Arquivos financeiros não ficam públicos.",
  },
  {
    icon: KeyRound,
    title: "Autenticação segura",
    text: "Acesso protegido à conta, com e-mail e senha.",
  },
  {
    icon: Trash2,
    title: "Você tem o controle",
    text: "Pode excluir os comprovantes armazenados quando quiser.",
  },
];

export function SecuritySection() {
  return (
    <Section id="seguranca">
      <Reveal>
        <Eyebrow>Segurança</Eyebrow>
        <SectionTitle className="mt-3">Seus dados financeiros continuam sendo seus.</SectionTitle>
        <Lead className="mt-4">Sem selos inventados. Só o que o Folio realmente faz hoje.</Lead>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ITEMS.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.04}>
            <article className="rounded-[1.75rem] bg-card p-5 ring-1 ring-border">
              <span className="grid size-10 place-items-center rounded-2xl bg-secondary">
                <item.icon className="size-4" />
              </span>
              <h3 className="mt-4 font-display text-2xl tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
