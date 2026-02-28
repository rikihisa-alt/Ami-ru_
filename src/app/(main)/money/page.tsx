"use client";

import { useState, useMemo, useEffect } from "react";
import { useMonthExpenses, useAddExpense, useDeleteExpense } from "@/lib/hooks/use-expenses";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { EXPENSE_CATEGORIES, getCategoryLabel } from "@/lib/utils/categories";
import { formatDate, formatMonthYear } from "@/lib/utils/date";
import { formatYen } from "@/lib/utils/currency";
import { calculateSettlement } from "@/lib/utils/settlement";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Trash2,
  Wallet,
} from "lucide-react";

export default function MoneyPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [formOpen, setFormOpen] = useState(false);

  const { data: expenses, isLoading } = useMonthExpenses(year, month);
  const addExpense = useAddExpense();
  const deleteExpense = useDeleteExpense();
  const supabase = useSupabase();
  const { user, profile } = useUser();

  const [partner, setPartner] = useState<{ id: string; display_name: string } | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [payerId, setPayerId] = useState(user?.id ?? "");
  const [bearer, setBearer] = useState("shared");
  const [ratioPayer, setRatioPayer] = useState(50);
  const [memo, setMemo] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (!profile?.pair_id || !user) return;
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("pair_id", profile.pair_id)
      .neq("id", user.id)
      .single()
      .then(({ data }) => setPartner(data));
  }, [profile?.pair_id, user, supabase]);

  useEffect(() => {
    if (user?.id) setPayerId(user.id);
  }, [user?.id]);

  const settlement = useMemo(() => {
    if (!expenses?.length || !user || !partner) return null;
    const result = calculateSettlement(expenses, user.id, partner.id);
    return {
      ...result,
      fromName:
        result.fromUser === user.id
          ? profile?.display_name
          : partner.display_name,
      toName:
        result.toUser === user.id
          ? profile?.display_name
          : partner.display_name,
    };
  }, [expenses, user, partner, profile?.display_name]);

  const categorySummary = useMemo(() => {
    if (!expenses) return [];
    const summary: Record<string, number> = {};
    for (const exp of expenses) {
      const cat = exp.category || "other";
      summary[cat] = (summary[cat] || 0) + exp.amount;
    }
    return Object.entries(summary)
      .map(([cat, total]) => ({ category: cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const totalAmount = useMemo(
    () => expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) ?? 0,
    [expenses]
  );

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) return;

    try {
      await addExpense.mutateAsync({
        amount: numAmount,
        category: category || undefined,
        payer_id: payerId,
        bearer,
        ratio_payer: bearer === "shared" ? ratioPayer : bearer === "payer" ? 100 : 0,
        memo: memo || undefined,
        date: expenseDate,
      });
      toast.success("支出を記録しました");
      setAmount("");
      setCategory("");
      setMemo("");
      setBearer("shared");
      setRatioPayer(50);
      setFormOpen(false);
    } catch {
      toast.error("記録に失敗しました");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">お金</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[100px] text-center text-sm font-medium">
            {formatMonthYear(new Date(year, month))}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settlement Card */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardContent className="pt-4">
          {!settlement || settlement.amount === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              精算なし
            </p>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="font-medium">{settlement.fromName}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium">{settlement.toName}</span>
              <span className="text-lg font-bold text-primary">
                {formatYen(settlement.amount)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Summary */}
      {categorySummary.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>カテゴリ別</span>
              <span className="text-muted-foreground">
                合計 {formatYen(totalAmount)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categorySummary.map(({ category: cat, total }) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span>
                    {getCategoryLabel(EXPENSE_CATEGORIES, cat)}
                  </span>
                  <span className="font-medium">{formatYen(total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : expenses?.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Wallet className="h-12 w-12" />
          <p>今月の支出はありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses?.map(
            (expense: {
              id: string;
              date: string;
              amount: number;
              category: string | null;
              payer_id: string;
              bearer: string;
              ratio_payer: number;
              memo: string | null;
            }) => (
              <Card key={expense.id} className="flex items-center gap-3 p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(EXPENSE_CATEGORIES, expense.category)}
                    </Badge>
                    <span className="font-medium">
                      {formatYen(expense.amount)}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(expense.date)}</span>
                    <span>
                      {expense.payer_id === user?.id
                        ? profile?.display_name
                        : partner?.display_name}
                      が支払い
                    </span>
                    {expense.bearer === "shared" && (
                      <span>
                        ({expense.ratio_payer}:{100 - expense.ratio_payer})
                      </span>
                    )}
                  </div>
                  {expense.memo && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {expense.memo}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => {
                    deleteExpense.mutate(expense.id);
                    toast.success("削除しました");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            )
          )}
        </div>
      )}

      {/* Add Expense Form */}
      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>支出を記録</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">金額 *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDate">日付</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>支払者</Label>
              <Select value={payerId} onValueChange={setPayerId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={user?.id ?? ""}>
                    {profile?.display_name || "自分"}
                  </SelectItem>
                  {partner && (
                    <SelectItem value={partner.id}>
                      {partner.display_name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>負担</Label>
              <Select value={bearer} onValueChange={setBearer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shared">共有（割り勘）</SelectItem>
                  <SelectItem value="payer">支払者のみ</SelectItem>
                  <SelectItem value="partner">相手のみ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bearer === "shared" && (
              <div className="space-y-2">
                <Label>
                  割合 (支払者 {ratioPayer}% : 相手 {100 - ratioPayer}%)
                </Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={ratioPayer}
                  onChange={(e) => setRatioPayer(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="memo">メモ</Label>
              <Input
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモ"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={addExpense.isPending}
            >
              {addExpense.isPending ? "記録中..." : "記録する"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
