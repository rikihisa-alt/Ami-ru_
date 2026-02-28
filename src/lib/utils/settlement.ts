type Expense = {
  amount: number;
  payer_id: string;
  bearer: string;
  ratio_payer: number;
};

export function calculateSettlement(
  expenses: Expense[],
  userAId: string,
  userBId: string
): { fromUser: string; toUser: string; amount: number } {
  let userAOwes = 0;
  let userBOwes = 0;

  for (const expense of expenses) {
    const payerIsA = expense.payer_id === userAId;
    const partnerShare =
      expense.amount - (expense.amount * expense.ratio_payer) / 100;

    if (expense.bearer === "shared") {
      if (payerIsA) {
        userBOwes += partnerShare;
      } else {
        userAOwes += partnerShare;
      }
    } else if (expense.bearer === "partner") {
      if (payerIsA) {
        userBOwes += expense.amount;
      } else {
        userAOwes += expense.amount;
      }
    }
    // bearer === 'payer': no settlement needed
  }

  const net = userAOwes - userBOwes;
  if (net > 0) {
    return { fromUser: userAId, toUser: userBId, amount: Math.round(net) };
  } else {
    return {
      fromUser: userBId,
      toUser: userAId,
      amount: Math.round(Math.abs(net)),
    };
  }
}
