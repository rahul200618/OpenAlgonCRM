import { Decimal } from "@prisma/client/runtime/client";
import { prismadb } from "@/lib/prisma";

// Re-export pure functions so existing server-side imports still work
export { findRate, convertAmount, formatCurrency } from "@/lib/currency-format";
export type { Rate } from "@/lib/currency-format";

export async function getExchangeRates() {
  try {
    const rates = await prismadb.exchangeRate.findMany();
    return rates.map((r: { fromCurrency: string; toCurrency: string; rate: Decimal }) => ({
      fromCurrency: r.fromCurrency,
      toCurrency: r.toCurrency,
      rate: r.rate,
    }));
  } catch (error) {
    console.warn("[Currency Service] Failed to fetch exchange rates, using empty array fallback.", error);
    return [];
  }
}

export async function getSnapshotRate(
  from: string,
  to: string
): Promise<Decimal | null> {
  if (from === to) return new Decimal("1");
  try {
    const rate = await prismadb.exchangeRate.findUnique({
      where: {
        fromCurrency_toCurrency: { fromCurrency: from, toCurrency: to },
      },
    });
    return rate ? rate.rate : null;
  } catch (error) {
    console.warn(`[Currency Service] Failed to fetch snapshot rate for ${from}->${to}, returning null.`, error);
    return null;
  }
}

export async function getDefaultCurrency(): Promise<string> {
  return "INR";
}

export async function getEnabledCurrencies() {
  return [
    {
      code: "INR",
      name: "Indian Rupee",
      symbol: "₹",
      isEnabled: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
