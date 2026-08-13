import {
  Banknote,
  Bike,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CircleDot,
  Cloud,
  Coffee,
  CreditCard,
  Droplets,
  Dumbbell,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  House,
  Landmark,
  Music,
  PawPrint,
  PiggyBank,
  Plane,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Stethoscope,
  Ticket,
  TrendingUp,
  Tv,
  type LucideIcon,
  Utensils,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Utensils,
  ShoppingCart,
  House,
  Car,
  Fuel,
  HeartPulse,
  Dumbbell,
  Gamepad2,
  RefreshCw,
  GraduationCap,
  ShoppingBag,
  Plane,
  TrendingUp,
  Landmark,
  Gift,
  PawPrint,
  Briefcase,
  Banknote,
  CircleDot,
  Tv,
  Music,
  Wifi,
  Smartphone,
  CreditCard,
  Zap,
  Droplets,
  Cloud,
  Sparkles,
  Wallet,
  PiggyBank,
  Coffee,
  Bus,
  Bike,
  Stethoscope,
  BookOpen,
  Ticket,
  Home,
};

const SIZE = {
  sm: { box: "size-8 rounded-xl", icon: "size-3.5" },
  md: { box: "size-11 rounded-2xl", icon: "size-5" },
  lg: { box: "size-14 rounded-2xl", icon: "size-6" },
} as const;

export function CategoryIcon({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string | null;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const Icon = ICONS[name];
  if (!Icon) return null;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-secondary text-foreground",
        SIZE[size].box,
        className,
      )}
      style={color ? { backgroundColor: `${color}22`, color } : undefined}
      aria-hidden
    >
      <Icon className={SIZE[size].icon} />
    </span>
  );
}

export { ICONS as CATEGORY_LUCIDE_ICONS };
