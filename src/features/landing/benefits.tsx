import { Camera, FolderOpen, CalendarClock, LineChart } from "lucide-react";
import { Reveal } from "@/features/landing/reveal";
import { Section } from "@/features/landing/ui";

const BENEFITS = [
  {
    icon: FolderOpen,
    title: "Gastos organizados",
    text: "Tudo categorizado e fácil de encontrar.",
  },
  {
    icon: CalendarClock,
    title: "Contas sob controle",
    text: "Saiba o que ainda vai sair da sua conta.",
  },
  {
    icon: Camera,
    title: "Menos digitação",
    text: "Fotografe um comprovante e deixe o Folio preencher as informações.",
  },
  {
    icon: LineChart,
    title: "Veja o que vem pela frente",
    text: "Tenha uma previsão dos próximos dias.",
  },
];

export function Benefits() {
  return (
    <Section id="recursos" tone="soft">
      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] bg-card p-5 ring-1 ring-border transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(15,31,22,0.35)]"
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/70">
                <item.icon className="size-4" />
              </span>
              <h3 className="mt-4 font-display text-2xl tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
