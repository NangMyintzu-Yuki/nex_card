import prisma from "@/lib/db/prisma";
import DiscountRuleManager from "./_components/discount-rule-manager";

export const dynamic = "force-dynamic";

export default async function DiscountRulesPage() {
  const rules = await prisma.discountRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = rules.map(r => ({
    ...r,
    percentage: Number(r.percentage),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-6 sm:px-6 lg:px-8">
      <DiscountRuleManager initialRules={serialized} />
    </div>
  );
}
