import {
  Car,
  CreditCard,
  Dumbbell,
  Home,
  Music,
  Plane,
  ShoppingCart,
  Tv,
  Utensils,
  Zap,
} from "lucide-react";

export const NAV_LINKS = [
  { href: "/#recursos", label: "Recursos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#seguranca", label: "Segurança" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const DEMO_TRANSACTIONS = [
  { name: "Uber", amount: "R$ 24,90", icon: Car, tint: "bg-secondary" },
  { name: "Supermercado", amount: "R$ 186,42", icon: ShoppingCart, tint: "bg-primary/40" },
  { name: "Netflix", amount: "R$ 55,90", icon: Tv, tint: "bg-secondary" },
  { name: "Academia", amount: "R$ 129,90", icon: Dumbbell, tint: "bg-primary/40" },
] as const;

export const VISUAL_TRANSACTIONS = [
  { name: "Supermercado", amount: "R$ 186,42", icon: ShoppingCart, category: "Alimentação" },
  { name: "Uber", amount: "R$ 24,90", icon: Car, category: "Transporte" },
  { name: "Aluguel", amount: "R$ 1.850,00", icon: Home, category: "Moradia" },
  { name: "Energia", amount: "R$ 184,32", icon: Zap, category: "Casa" },
  { name: "Spotify", amount: "R$ 21,90", icon: Music, category: "Assinatura" },
  { name: "Netflix", amount: "R$ 55,90", icon: Tv, category: "Assinatura" },
  { name: "Academia", amount: "R$ 129,90", icon: Dumbbell, category: "Saúde" },
  { name: "Viagem", amount: "R$ 890,00", icon: Plane, category: "Lazer" },
  { name: "Restaurante", amount: "R$ 78,40", icon: Utensils, category: "Alimentação" },
] as const;

export const DEMO_BILLS = [
  { name: "Netflix", date: "15 AGO", amount: "R$ 55,90", status: "pago" as const, icon: Tv },
  { name: "Energia", date: "18 AGO", amount: "R$ 184,32", status: "próximo" as const, icon: Zap },
  { name: "Academia", date: "20 AGO", amount: "R$ 129,90", status: "próximo" as const, icon: Dumbbell },
  { name: "Nubank", date: "25 AGO", amount: "R$ 2.430,82", status: "atrasado" as const, icon: CreditCard },
] as const;

export const DEMO_SUBSCRIPTIONS = [
  { name: "Netflix", amount: "R$ 55,90" },
  { name: "Spotify", amount: "R$ 21,90" },
  { name: "ChatGPT", amount: "R$ 109,90" },
  { name: "iCloud", amount: "R$ 21,90" },
] as const;

export const DEMO_BUDGETS = [
  { name: "Alimentação", spent: "R$ 620", limit: "R$ 800", percent: 77 },
  { name: "Lazer", spent: "R$ 320", limit: "R$ 500", percent: 64 },
  { name: "Transporte", spent: "R$ 410", limit: "R$ 600", percent: 68 },
] as const;

export const DEMO_GOALS = [
  { name: "Viagem", current: "R$ 4.500", target: "R$ 12.000", percent: 37.5 },
  { name: "MacBook", current: "R$ 6.200", target: "R$ 12.000", percent: 51 },
] as const;
