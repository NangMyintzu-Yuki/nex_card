import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import DiscountRuleManager from "./_components/discount-rule-manager";

export const dynamic = "force-dynamic";

export default async function DiscountRulesPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

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
