export interface MoneyTransaction {
  id: string;
  pair_id: string;
  type: "income" | "expense";
  amount: number;
  category: string | null;
  is_confirmed: boolean;
  scheduled_date: string | null;
  recurrence: string | null;
  memo: string | null;
  created_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category?: string;
  payer_id: string;
  bearer: string;
  ratio_payer: number;
  memo?: string;
}

/**
 * 残高を計算
 * initialBalance + SUM(confirmed income) - SUM(expenses) - SUM(confirmed expense transactions)
 */
export function calculateBalance(
  initialBalance: number,
  transactions: MoneyTransaction[],
  expenses: Expense[]
): number {
  const confirmedIncome = transactions
    .filter((t) => t.type === "income" && t.is_confirmed)
    .reduce((sum, t) => sum + t.amount, 0);

  const confirmedExpenseTx = transactions
    .filter((t) => t.type === "expense" && t.is_confirmed)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return initialBalance + confirmedIncome - totalExpenses - confirmedExpenseTx;
}

/**
 * 日ごとの累計残高を計算（チャート用）
 * 月初から月末まで、各日の残高推移を返す
 */
export function calculateDailyBalance(
  initialBalance: number,
  transactions: MoneyTransaction[],
  expenses: Expense[],
  daysInMonth: string[] // YYYY-MM-DD[]
): { date: string; balance: number }[] {
  let runningBalance = initialBalance;
  const result: { date: string; balance: number }[] = [];

  for (const day of daysInMonth) {
    // この日の収入
    const dayIncome = transactions
      .filter((t) => t.type === "income" && t.is_confirmed && t.scheduled_date === day)
      .reduce((sum, t) => sum + t.amount, 0);

    // この日の支出トランザクション
    const dayExpenseTx = transactions
      .filter((t) => t.type === "expense" && t.is_confirmed && t.scheduled_date === day)
      .reduce((sum, t) => sum + t.amount, 0);

    // この日の支出(expenses テーブル)
    const dayExpenses = expenses
      .filter((e) => e.date === day)
      .reduce((sum, e) => sum + e.amount, 0);

    runningBalance += dayIncome - dayExpenses - dayExpenseTx;
    result.push({ date: day, balance: runningBalance });
  }

  return result;
}
