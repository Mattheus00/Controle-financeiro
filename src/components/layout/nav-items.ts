import {
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  RefreshCw,
  Settings,
  Target,
  Wallet,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: Receipt },
  { href: "/bills", label: "Contas", icon: Wallet },
  { href: "/cards", label: "Cartões", icon: CreditCard },
  { href: "/subscriptions", label: "Assinaturas", icon: RefreshCw },
  { href: "/budgets", label: "Orçamento", icon: PiggyBank },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/calendar", label: "Calendário", icon: LayoutDashboard, hideOnMobile: true },
  { href: "/reports", label: "Relatórios", icon: LayoutDashboard, hideOnMobile: true },
  { href: "/settings", label: "Configurações", icon: Settings, hideOnMobile: true },
] as const;
