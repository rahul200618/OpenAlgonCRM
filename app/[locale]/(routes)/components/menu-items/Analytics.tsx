import { PieChart } from "lucide-react";
import { NavItem } from "../nav-main";

export function getAnalyticsMenuItem({ title }: { title: string }): NavItem {
  return {
    title,
    url: "/analytics",
    icon: PieChart,
    isPremium: true,
  };
}
