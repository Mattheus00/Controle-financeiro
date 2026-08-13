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
import { initialsFromName } from "@/lib/icons";

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

export function EntityIcon({
  name,
  label,
  color,
  className,
}: {
  name?: string | null;
  label?: string;
  color?: string;
  className?: string;
}) {
  const Icon = name ? ICONS[name] : undefined;

  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-foreground",
        className,
      )}
      style={color ? { backgroundColor: `${color}22`, color } : undefined}
      aria-hidden={label ? undefined : true}
    >
      {Icon ? (
        <Icon className="size-5" />
      ) : (
        <span className="text-xs font-semibold">{initialsFromName(label ?? "?")}</span>
      )}
    </span>
  );
}
