"use client";

import { useState, useEffect } from "react";
import {
  useAddTransaction,
  useUpdateTransaction,
} from "@/lib/hooks/use-transactions";
import { PrismButton } from "@/components/ui/prism-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const INCOME_CATEGORIES = [
  { value: "salary", label: "給料" },
  { value: "bonus", label: "ボーナス" },
  { value: "side_income", label: "副収入" },
  { value: "other", label: "その他" },
] as const;

const EXPENSE_TX_CATEGORIES = [
  { value: "rent", label: "家賃" },
  { value: "utilities", label: "光熱費" },
  { value: "communication", label: "通信費" },
  { value: "insurance", label: "保険" },
  { value: "subscription", label: "サブスク" },
  { value: "other", label: "その他" },
] as const;

interface TransactionFormProps {
  editTransaction?: {
    id: string;
    type: "income" | "expense";
    amount: number;
    category: string | null;
    is_confirmed: boolean;
    scheduled_date: string | null;
    memo: string | null;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransactionForm({
  editTransaction,
  open,
  onOpenChange,
}: TransactionFormProps) {
  const isEditMode = !!editTransaction;

  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [memo, setMemo] = useState("");

  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();

  // Pre-fill when editing
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setCategory(editTransaction.category ?? "");
      setScheduledDate(
        editTransaction.scheduled_date ??
          new Date().toISOString().split("T")[0]
      );
      setIsConfirmed(editTransaction.is_confirmed);
      setMemo(editTransaction.memo ?? "");
    }
  }, [editTransaction]);

  const resetForm = () => {
    setType("income");
    setAmount("");
    setCategory("");
    setScheduledDate(new Date().toISOString().split("T")[0]);
    setIsConfirmed(true);
    setMemo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      toast.error("金額を正しく入力してください");
      return;
    }

    try {
      if (isEditMode && editTransaction) {
        await updateTransaction.mutateAsync({
          txId: editTransaction.id,
          updates: {
            type,
            amount: numAmount,
            category: category || null,
            scheduled_date: scheduledDate || null,
            is_confirmed: isConfirmed,
            memo: memo || null,
          },
        });
        toast.success("更新しました");
      } else {
        await addTransaction.mutateAsync({
          type,
          amount: numAmount,
          category: category || undefined,
          scheduled_date: scheduledDate || undefined,
          is_confirmed: isConfirmed,
          memo: memo || undefined,
        });
        toast.success("登録しました");
      }
      resetForm();
      onOpenChange?.(false);
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  const isPending = addTransaction.isPending || updateTransaction.isPending;
  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_TX_CATEGORIES;

  const formContent = (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {/* Type toggle */}
      <div className="space-y-2">
        <Label>種別</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategory("");
            }}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              type === "income"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            収入
          </button>
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategory("");
            }}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              type === "expense"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            支出
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="tx-amount">金額 *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ¥
          </span>
          <Input
            id="tx-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="rounded-xl pl-7"
            autoFocus
            required
            min={1}
          />
        </div>
      </div>

      {/* Category + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>カテゴリ</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-date">日付</Label>
          <Input
            id="tx-date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Confirmed toggle */}
      <div className="space-y-2">
        <Label>ステータス</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsConfirmed(true)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              isConfirmed
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            確定
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmed(false)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              !isConfirmed
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            予定
          </button>
        </div>
      </div>

      {/* Memo */}
      <div className="space-y-2">
        <Label htmlFor="tx-memo">メモ</Label>
        <Input
          id="tx-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモ"
          className="rounded-xl"
        />
      </div>

      <PrismButton type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "保存中..."
          : isEditMode
            ? "更新する"
            : "登録する"}
      </PrismButton>
    </form>
  );

  // Edit mode: controlled sheet without FAB trigger
  if (isEditMode) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>収支を編集</SheetTitle>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Add mode: with FAB trigger
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <PrismButton
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg lg:bottom-8"
        >
          <Plus className="h-6 w-6" />
        </PrismButton>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>収支を登録</SheetTitle>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  );
}
