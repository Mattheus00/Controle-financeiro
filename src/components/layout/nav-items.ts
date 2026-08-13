import {
  BarChart3,
  CalendarDays,
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
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/settings", label: "Perfil", icon: Settings },
] as const;
