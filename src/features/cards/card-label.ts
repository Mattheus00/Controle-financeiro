export function creditCardLabel(card: {
  name: string;
  last_four?: string | null;
}) {
  return card.last_four ? `${card.name} •••• ${card.last_four}` : card.name;
}
