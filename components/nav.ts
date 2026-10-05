import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  TargetIcon,
  PiggyBankIcon,
  BarChart3Icon,
  HistoryIcon,
  TagsIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRightIcon },
  { href: "/anggaran", label: "Anggaran", icon: TargetIcon },
  { href: "/tabungan", label: "Tabungan", icon: PiggyBankIcon },
  { href: "/analisis", label: "Analisis", icon: BarChart3Icon },
  { href: "/histori", label: "Histori", icon: HistoryIcon },
  { href: "/kategori", label: "Kategori", icon: TagsIcon },
];
