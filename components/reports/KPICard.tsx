"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { KPIData } from "@/actions/reports/types";
import { useTranslations } from "next-intl";

const currencyLocaleMap: Record<string, string> = {
  INR: "en-IN",
};

function formatValue(value: number, label: string, currency: string = "INR"): string {
  if (label === "totalRevenue" || label === "pipelineValue") {
    const locale = currencyLocaleMap[currency] || "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  }
  if (label === "conversionRate") return `${value}%`;
  return new Intl.NumberFormat("en-US").format(value);
}

import { motion, useMotionValue, useTransform, useSpring, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function KPICard({ kpi, dateParams, displayCurrency = "USD" }: { kpi: KPIData; dateParams: string; displayCurrency?: string }) {
  const t = useTranslations("ReportsPage.kpi");
  const isPositive = kpi.changePercent > 0;
  const isZero = kpi.changePercent === 0;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={`${kpi.href}?${dateParams}`}>
      <motion.div
        variants={itemVariants}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="perspective-1000"
      >
        <Card className="glass-card bg-background/40 backdrop-blur-2xl cursor-pointer transition-colors hover:shadow-2xl hover:shadow-primary/20 border-white/10 dark:border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10" style={{ transform: "translateZ(20px)" }}>
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">{t(kpi.label)}</CardTitle>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? "bg-green-500/10 text-green-600 dark:text-green-400" : isZero ? "bg-gray-500/10 text-gray-500 dark:text-gray-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : isZero ? <Minus className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              <span>{Math.abs(kpi.changePercent)}%</span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10" style={{ transform: "translateZ(30px)" }}>
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {formatValue(kpi.value, kpi.label, displayCurrency)}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
