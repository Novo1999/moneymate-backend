enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

enum ExpenseCategory {
  FOOD_DRINKS = 'food_drinks',
  SHOPPING = 'shopping',
  HOUSING = 'housing',
  TRANSPORTATION = 'transportation',
  VEHICLE = 'vehicle',
  LIFE_ENTERTAINMENT = 'life_entertainment',
  COMMUNICATION_PC = 'communication_pc',
  FINANCIAL_EXPENSES = 'financial_expenses',
  INVESTMENTS = 'investments',
  OTHERS_EXPENSE = 'others_expense',
  TRANSFER = 'transfer_income',
}

enum IncomeCategory {
  SALARY = 'salary',
  AWARDS = 'awards',
  GRANTS = 'grants',
  SALE = 'sale',
  RENTAL = 'rental',
  REFUNDS = 'refunds',
  COUPON = 'coupon',
  LOTTERY = 'lottery',
  GIFTS = 'gifts',
  INTERESTS = 'interests',
  OTHERS_INCOME = 'others_income',
  TRANSFER = 'transfer',
}

export { ExpenseCategory, IncomeCategory, TransactionType };

