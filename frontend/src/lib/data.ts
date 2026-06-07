export type Category =
  | "Shopping"
  | "Food"
  | "Transport"
  | "Groceries"
  | "Eating Out"
  | "Rent"
  | "EMI"
  | "Education"
  | "Entertainment"
  | "Bills"
  | "Lifestyle"
  | "Other";

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: Category;
  amount: number;
  type?: 'income' | 'expense';
  account_id?: string;
}

export interface BudgetGoal {
  category: Category;
  budget: number;
  spent: number;
}

export const categoryColors: Record<Category, string> = {
  Shopping: "bg-purple-500",
  Food: "bg-orange-500",
  Transport: "bg-blue-500",
  Groceries: "bg-category-groceries",
  "Eating Out": "bg-category-eating-out",
  Rent: "bg-category-rent",
  EMI: "bg-category-emi",
  Education: "bg-blue-500",
  Entertainment: "bg-red-500",
  Bills: "bg-red-500",
  Lifestyle: "bg-pink-500",
  Other: "bg-gray-500",
};

export const categoryTextColors: Record<Category, string> = {
  Shopping: "text-purple-500",
  Food: "text-orange-500",
  Transport: "text-blue-500",
  Groceries: "text-category-groceries",
  "Eating Out": "text-category-eating-out",
  Rent: "text-category-rent",
  EMI: "text-category-emi",
  Education: "text-blue-500",
  Entertainment: "text-red-500",
  Bills: "text-red-500",
  Lifestyle: "text-pink-500",
  Other: "text-gray-500",
};

export const categoryBgLight: Record<Category, string> = {
  Shopping: "bg-purple-500/10 text-purple-700 border-purple-200",
  Food: "bg-orange-500/10 text-orange-700 border-orange-200",
  Transport: "bg-blue-500/10 text-blue-700 border-blue-200",
  Groceries: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "Eating Out": "bg-orange-500/10 text-orange-700 border-orange-200",
  Rent: "bg-blue-500/10 text-blue-700 border-blue-200",
  EMI: "bg-purple-500/10 text-purple-700 border-purple-200",
  Education: "bg-blue-500/10 text-blue-700 border-blue-200",
  Entertainment: "bg-red-500/10 text-red-700 border-red-200",
  Bills: "bg-red-500/10 text-red-700 border-red-200",
  Lifestyle: "bg-pink-500/10 text-pink-700 border-pink-200",
  Other: "bg-gray-500/10 text-gray-700 border-gray-200",
};

export const defaultBudgets: BudgetGoal[] = [
  { category: "Food", budget: 5000, spent: 4200 },
  { category: "Transport", budget: 3000, spent: 1500 },
  { category: "Shopping", budget: 7000, spent: 8500 },
  { category: "Entertainment", budget: 2000, spent: 1800 },
  { category: "Bills", budget: 4000, spent: 4000 },
];

export const defaultTransactions: Transaction[] = [
  { id: "1", date: "2026-02-01", merchant: "Salary Account", category: "Other", amount: 150000, type: "income", account_id: "1" },
  { id: "2", date: "2026-02-02", merchant: "House Rent", category: "Rent", amount: 25000, type: "expense", account_id: "1" },
  { id: "3", date: "2026-02-02", merchant: "Netflix Subscription", category: "Entertainment", amount: 649, type: "expense", account_id: "1" },
  { id: "4", date: "2026-02-03", merchant: "Reliance Smart", category: "Groceries", amount: 4500, type: "expense", account_id: "1" },
  { id: "5", date: "2026-02-04", merchant: "Uber Ride", category: "Transport", amount: 350, type: "expense", account_id: "1" },
  { id: "6", date: "2026-02-05", merchant: "Starbucks", category: "Eating Out", amount: 450, type: "expense", account_id: "1" },
  { id: "7", date: "2026-02-05", merchant: "Amazon India", category: "Shopping", amount: 5200, type: "expense", account_id: "1" },
  { id: "8", date: "2026-02-06", merchant: "Shell Fuel Station", category: "Transport", amount: 2500, type: "expense", account_id: "1" },
  { id: "9", date: "2026-02-06", merchant: "Zomato", category: "Food", amount: 850, type: "expense", account_id: "1" },
  { id: "10", date: "2026-02-07", merchant: "Spotify Premium", category: "Entertainment", amount: 119, type: "expense", account_id: "1" },
];

export const formatCurrency = (amount: number, currencyCode: string = "INR"): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
