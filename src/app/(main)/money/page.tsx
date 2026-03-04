"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect } from "react";
import { getDaysInMonth, format } from "date-fns";
import {
  useMonthExpenses,
  useAddExpense,
  useDeleteExpense,
} from "@/lib/hooks/use-expenses";
import {
  useMonthTransactions,
  useDeleteTransaction,
} from "@/lib/hooks/use-transactions";
import { useSupabase, useUser } from "@/providers/supabase-provider";
import { PrismButton } from "@/components/ui/prism-button";
import { PrismCard } from "@/components/ui/prism-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EXPENSE_CATEGORIES, getCategoryLabel } from "@/lib/utils/categories";
import { formatDate, formatMonthYear } from "@/lib/utils/date";
import { formatYen } from "@/lib/utils/currency";
import { calculateSettlement } from "@/lib/utils/settlement";
import {
  calculateBalance,
  calculateDailyBalance,
} from "@/lib/utils/balance";
import { BalanceCard } from "@/components/money/balance-card";
import { BalanceChart } from "@/components/money/balance-chart";
import { TransactionForm } from "@/components/money/transaction-form";
import { TransactionList } from "@/components/money/transaction-list";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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

  // Expense form state
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [payerId, setPayerId] = useState("");
  const [bearer, setBearer] = useState("shared");
  const [ratioPayer, setRatioPayer] = useState(50);
  const [memo, setMemo] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Transaction form state
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<any | null>(null);

  // Delete confirm state
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<string | null>(
    null
  );
  const [deleteTxTarget, setDeleteTxTarget] = useState<string | null>(null);

  // Initial balance
  const [initialBalance, setInitialBalance] = useState(0);
  const [initialBalanceInput, setInitialBalanceInput] = useState("");
  const [initialBalanceDialogOpen, setInitialBalanceDialogOpen] =
    useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("expenses");

  // Hooks
  const { data: expenses } = useMonthExpenses(year, month);
  const { data: transactions } = useMonthTransactions(year, month);
  const addExpense = useAddExpense();
  const deleteExpense = useDeleteExpense();
  const deleteTxMutation = useDeleteTransaction();
  const supabase = useSupabase();
  const { user, profile } = useUser();

  const [partner, setPartner] = useState<{
    id: string;
    display_name: string;
  } | null>(null);

  // Fetch partner
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

  // Fetch initial balance from pairs table
  useEffect(() => {
    if (!profile?.pair_id) return;
    supabase
      .from("pairs")
      .select("initial_balance")
      .eq("id", profile.pair_id)
      .single()
      .then(({ data }) => {
        if (data?.initial_balance != null) {
          setInitialBalance(data.initial_balance);
        }
      });
  }, [profile?.pair_id, supabase]);

  useEffect(() => {
    if (user?.id) setPayerId(user.id);
  }, [user?.id]);

  // Settlement calculation (expenses tab)
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

  // Category summary (expenses tab)
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

  const totalExpenseAmount = useMemo(
    () =>
      expenses?.reduce(
        (sum: number, e: { amount: number }) => sum + e.amount,
        0
      ) ?? 0,
    [expenses]
  );

  // Balance calculation
  const currentBalance = useMemo(() => {
    return calculateBalance(
      initialBalance,
      transactions ?? [],
      expenses ?? []
    );
  }, [initialBalance, transactions, expenses]);

  // Chart data
  const chartData = useMemo(() => {
    const numDays = getDaysInMonth(new Date(year, month));
    const daysArray: string[] = [];
    for (let d = 1; d <= numDays; d++) {
      daysArray.push(
        format(new Date(year, month, d), "yyyy-MM-dd")
      );
    }
    return calculateDailyBalance(
      initialBalance,
      transactions ?? [],
      expenses ?? [],
      daysArray
    );
  }, [initialBalance, transactions, expenses, year, month]);

  // Month navigation
  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // Expense form submit
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) return;

    try {
      await addExpense.mutateAsync({
        amount: numAmount,
        category: category || undefined,
        payer_id: payerId,
        bearer,
        ratio_payer:
          bearer === "shared" ? ratioPayer : bearer === "payer" ? 100 : 0,
        memo: memo || undefined,
        date: expenseDate,
      });
      toast.success("支出を記録しました");
      setAmount("");
      setCategory("");
      setMemo("");
      setBearer("shared");
      setRatioPayer(50);
      setExpenseFormOpen(false);
    } catch {
      // silent in demo mode
    }
  };

  // Handle expense delete
  const handleDeleteExpense = () => {
    if (!deleteExpenseTarget) return;
    deleteExpense.mutate(deleteExpenseTarget);
    toast.success("削除しました");
    setDeleteExpenseTarget(null);
  };

  // Handle transaction delete
  const handleDeleteTransaction = () => {
    if (!deleteTxTarget) return;
    deleteTxMutation.mutate(deleteTxTarget);
    toast.success("削除しました");
    setDeleteTxTarget(null);
  };

  // Handle initial balance save
  const handleSaveInitialBalance = async () => {
    const num = parseInt(initialBalanceInput, 10);
    if (isNaN(num)) {
      toast.error("金額を正しく入力してください");
      return;
    }
    if (!profile?.pair_id) return;

    try {
      const { error } = await supabase
        .from("pairs")
        .update({ initial_balance: num })
        .eq("id", profile.pair_id);
      if (error) throw error;
      setInitialBalance(num);
      setInitialBalanceDialogOpen(false);
      toast.success("初期残高を更新しました");
    } catch {
      // silent in demo mode
    }
  };

  // Open edit transaction
  const handleEditTransaction = (tx: any) => {
    setEditTx(tx);
    setTxFormOpen(true);
  };

  // Close edit transaction
  const handleTxFormClose = (open: boolean) => {
    setTxFormOpen(open);
    if (!open) {
      setEditTx(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + Month Navigation */}
      <div className="flex items-center justify-between motion-safe:animate-prism-fade-up">
        <div className="flex items-center gap-2.5">
          <Wallet className="h-5 w-5 text-sky-400" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            お金
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <PrismButton variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </PrismButton>
          <span className="min-w-[100px] text-center text-sm font-medium">
            {formatMonthYear(new Date(year, month))}
          </span>
          <PrismButton variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </PrismButton>
        </div>
      </div>

      {/* Balance Card (always visible) */}
      <BalanceCard
        balance={currentBalance}
        initialBalance={initialBalance}
        onEditInitialBalance={() => {
          setInitialBalanceInput(String(initialBalance));
          setInitialBalanceDialogOpen(true);
        }}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="expenses" className="flex-1">
            支出
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex-1">
            収支
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex-1">
            推移
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Expenses (preserve existing logic) */}
        <TabsContent value="expenses" className="mt-4 space-y-4">
          {/* Settlement card */}
          <PrismCard variant="accent" animationIndex={1}>
            {!settlement || settlement.amount === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                精算なし
              </p>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="font-medium">{settlement.fromName}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{settlement.toName}</span>
                <span className="text-lg font-bold text-primary">
                  {formatYen(settlement.amount)}
                </span>
              </div>
            )}
          </PrismCard>

          {/* Category summary */}
          {categorySummary.length > 0 && (
            <PrismCard variant="flat" animationIndex={2}>
              <div className="flex items-center justify-between pb-3">
                <p className="text-sm font-semibold">カテゴリ別</p>
                <p className="text-sm font-bold text-primary">
                  合計 {formatYen(totalExpenseAmount)}
                </p>
              </div>
              <div className="space-y-2">
                {categorySummary.map(({ category: cat, total }) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {getCategoryLabel(EXPENSE_CATEGORIES, cat)}
                    </span>
                    <span className="font-medium">{formatYen(total)}</span>
                  </div>
                ))}
              </div>
            </PrismCard>
          )}

          {/* Expense list */}
          {expenses?.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground motion-safe:animate-prism-fade-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Wallet className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-medium">今月の支出はありません</p>
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
                  <PrismCard
                    key={expense.id}
                    variant="flat"
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs"
                        >
                          {getCategoryLabel(
                            EXPENSE_CATEGORIES,
                            expense.category
                          )}
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
                            ({expense.ratio_payer}:
                            {100 - expense.ratio_payer})
                          </span>
                        )}
                      </div>
                      {expense.memo && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {expense.memo}
                        </p>
                      )}
                    </div>
                    <PrismButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteExpenseTarget(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </PrismButton>
                  </PrismCard>
                )
              )}
            </div>
          )}

          {/* Expense FAB + Sheet */}
          <Sheet open={expenseFormOpen} onOpenChange={setExpenseFormOpen}>
            <SheetTrigger asChild>
              <PrismButton
                size="icon"
                className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg lg:bottom-8"
              >
                <Plus className="h-6 w-6" />
              </PrismButton>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="mx-auto max-w-lg rounded-t-2xl"
            >
              <SheetHeader>
                <SheetTitle>支出を記録</SheetTitle>
              </SheetHeader>
              <form
                onSubmit={handleExpenseSubmit}
                className="mt-4 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="amount">金額 *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="rounded-xl"
                    autoFocus
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>カテゴリ</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="rounded-xl">
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
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>支払者</Label>
                  <Select value={payerId} onValueChange={setPayerId}>
                    <SelectTrigger className="rounded-xl">
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
                    <SelectTrigger className="rounded-xl">
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
                      割合 (支払者 {ratioPayer}% : 相手{" "}
                      {100 - ratioPayer}%)
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={ratioPayer}
                      onChange={(e) =>
                        setRatioPayer(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-primary"
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
                    className="rounded-xl"
                  />
                </div>
                <PrismButton
                  type="submit"
                  className="w-full"
                  disabled={addExpense.isPending}
                >
                  {addExpense.isPending ? "記録中..." : "記録する"}
                </PrismButton>
              </form>
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* Tab 2: Transactions (income & fixed expenses) */}
        <TabsContent value="transactions" className="mt-4 space-y-4">
          <TransactionList
            transactions={transactions ?? []}
            onEdit={handleEditTransaction}
            onDelete={(txId) => setDeleteTxTarget(txId)}
          />

          {/* Transaction form - Add mode */}
          {!editTx && (
            <TransactionForm
              open={txFormOpen}
              onOpenChange={handleTxFormClose}
            />
          )}

          {/* Transaction form - Edit mode */}
          {editTx && (
            <TransactionForm
              editTransaction={editTx}
              open={txFormOpen}
              onOpenChange={handleTxFormClose}
            />
          )}
        </TabsContent>

        {/* Tab 3: Chart */}
        <TabsContent value="chart" className="mt-4 space-y-4">
          <BalanceChart data={chartData} />

          {/* Summary stats under chart */}
            <div className="grid grid-cols-2 gap-3">
              <PrismCard variant="flat" animationIndex={4}>
                <p className="text-xs text-muted-foreground">収入合計</p>
                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatYen(
                    (transactions ?? [])
                      .filter(
                        (t: { type: string; is_confirmed: boolean }) =>
                          t.type === "income" && t.is_confirmed
                      )
                      .reduce(
                        (sum: number, t: { amount: number }) =>
                          sum + t.amount,
                        0
                      )
                  )}
                </p>
              </PrismCard>
              <PrismCard variant="flat" animationIndex={5}>
                <p className="text-xs text-muted-foreground">支出合計</p>
                <p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">
                  {formatYen(
                    totalExpenseAmount +
                      (transactions ?? [])
                        .filter(
                          (t: { type: string; is_confirmed: boolean }) =>
                            t.type === "expense" && t.is_confirmed
                        )
                        .reduce(
                          (sum: number, t: { amount: number }) =>
                            sum + t.amount,
                          0
                        )
                  )}
                </p>
              </PrismCard>
            </div>
        </TabsContent>
      </Tabs>

      {/* Delete Expense Confirm */}
      <ConfirmDialog
        open={!!deleteExpenseTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteExpenseTarget(null);
        }}
        title="支出を削除"
        description="この支出を削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteExpense}
        isPending={deleteExpense.isPending}
      />

      {/* Delete Transaction Confirm */}
      <ConfirmDialog
        open={!!deleteTxTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTxTarget(null);
        }}
        title="収支を削除"
        description="この収支データを削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteTransaction}
        isPending={deleteTxMutation.isPending}
      />

      {/* Initial Balance Edit Dialog */}
      <Dialog
        open={initialBalanceDialogOpen}
        onOpenChange={setInitialBalanceDialogOpen}
      >
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>初期残高を設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="initial-balance">月初の残高</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ¥
              </span>
              <Input
                id="initial-balance"
                type="number"
                value={initialBalanceInput}
                onChange={(e) => setInitialBalanceInput(e.target.value)}
                placeholder="0"
                className="rounded-xl pl-7"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              月初時点の口座残高や手持ち現金の合計を入力してください
            </p>
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <PrismButton
              variant="ghost"
              size="sm"
              onClick={() => setInitialBalanceDialogOpen(false)}
            >
              キャンセル
            </PrismButton>
            <PrismButton size="sm" onClick={handleSaveInitialBalance}>
              保存する
            </PrismButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
