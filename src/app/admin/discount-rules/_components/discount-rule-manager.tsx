"use client";

import { useState, useTransition } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  PercentIcon,
  BuildingIcon,
  UsersIcon,
} from "lucide-react";
import { createDiscountRuleAction, deleteDiscountRuleAction, toggleDiscountRuleActive } from "@/lib/actions/discount-rule-actions";

type DiscountRule = {
  id: string;
  name: string;
  type: string;
  percentage: number;
  minQuantity: number | null;
  isActive: boolean;
  appliedCount: number;
};

interface Props {
  initialRules: DiscountRule[];
}

const TYPE_LABELS: Record<string, string> = {
  COMPANY: "Company / Org",
  BULK: "Bulk Order",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  COMPANY: <BuildingIcon className="w-4 h-4" />,
  BULK: <UsersIcon className="w-4 h-4" />,
};

export default function DiscountRuleManager({ initialRules }: Props) {
  const [rules, setRules] = useState<DiscountRule[]>(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"COMPANY" | "BULK">("COMPANY");
  const [formPct, setFormPct] = useState(5);
  const [formMinQty, setFormMinQty] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formName);
    fd.append("type", formType);
    fd.append("percentage", String(formPct));
    if (formMinQty) fd.append("minQuantity", formMinQty);

    const result = await createDiscountRuleAction(fd);
    if (result?.success) {
      setRules(prev => [...prev, { ...result.rule, appliedCount: 0 }]);
      setFormName("");
      setFormPct(5);
      setFormMinQty("");
      setShowForm(false);
    }
  };

  const handleToggle = async (id: string) => {
    startTransition(async () => {
      await toggleDiscountRuleActive(id);
      setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    startTransition(async () => {
      await deleteDiscountRuleAction(id);
      setRules(prev => prev.filter(r => r.id !== id));
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Discount Rules
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automatic discounts applied before coupons
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rule Name
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Company Discount"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formType}
                onChange={e => setFormType(e.target.value as "COMPANY" | "BULK")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="COMPANY">Company / Organization (5%)</option>
                <option value="BULK">Bulk Order (10+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount %
              </label>
              <input
                type="number"
                required
                min={0.1}
                max={100}
                step={0.1}
                value={formPct}
                onChange={e => setFormPct(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            {formType === "BULK" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Quantity (profiles)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formMinQty}
                  onChange={e => setFormMinQty(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              <CheckIcon className="w-4 h-4" />
              {isPending ? "Creating..." : "Create Rule"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
            >
              <XIcon className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No discount rules yet
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border p-5 transition-all ${
                rule.isActive
                  ? "border-green-200 dark:border-green-800/50"
                  : "border-gray-200 dark:border-gray-800 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    rule.type === "COMPANY"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  }`}>
                    {TYPE_ICONS[rule.type]}
                    {TYPE_LABELS[rule.type]}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(rule.id)}
                  disabled={isPending}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    rule.isActive ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    rule.isActive ? "translate-x-4.5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                {rule.name}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                {rule.percentage}% OFF
              </p>
              {rule.type === "BULK" && rule.minQuantity && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Min. {rule.minQuantity} profiles
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                Applied {rule.appliedCount} times
              </p>
              <button
                onClick={() => handleDelete(rule.id)}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
