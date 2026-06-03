import { PrismaClient, ExchangeRateSource } from "@prisma/client";

const currencies = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", isEnabled: true, isDefault: true },
];

const rates = [
  { fromCurrency: "INR", toCurrency: "INR", rate: 1.0, source: ExchangeRateSource.ECB },
];

export async function seedCurrencies(prisma: PrismaClient) {
  console.log("Seeding currencies...");

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { name: currency.name, symbol: currency.symbol, isEnabled: currency.isEnabled, isDefault: currency.isDefault },
      create: currency,
    });
  }

  for (const rate of rates) {
    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
        },
      },
      update: { rate: rate.rate, source: rate.source },
      create: rate,
    });
  }

  await prisma.crm_SystemSettings.upsert({
    where: { key: "ecb_auto_update" },
    update: {},
    create: { key: "ecb_auto_update", value: "false" },
  });

  await prisma.crm_SystemSettings.upsert({
    where: { key: "default_currency" },
    update: { value: "INR" },
    create: { key: "default_currency", value: "INR" },
  });

  console.log("Currencies seeded.");
}
