// MOCK DATA - DELETE THIS FILE BEFORE DEPLOYMENT
// Simulates Supabase data for local testing since AA bank sync doesn't work locally

import type { Transaction, Category } from "./data";

const MOCK_USER_ID = "mock-user-001";

const categories: Category[] = [
  "Shopping", "Food", "Transport", "Groceries", "Eating Out",
  "Rent", "EMI", "Education", "Entertainment", "Bills", "Lifestyle", "Other"
];

const merchants: Record<string, string[]> = {
  Shopping: ["Amazon", "Flipkart", "Myntra", "Ajio", "Reliance Digital", "Decathlon"],
  Food: ["Zomato", "Swiggy", "Domino's", "Pizza Hut", "McDonald's"],
  Transport: ["Uber", "Ola", "Indian Oil", "BPCL", "Metro Card", "Fastag Recharge"],
  Groceries: ["Big Bazaar", "DMart", "Blinkit", "Zepto", "JioMart"],
  "Eating Out": ["Barbeque Nation", "Local Dhaba", "Starbucks", "Cafe Coffee Day"],
  Rent: ["Landlord - Rent"],
  EMI: ["HDFC EMI", "ICICI EMI", "Bajaj Finserv"],
  Education: ["Coursera", "Udemy", "Skillshare", "Book Store"],
  Entertainment: ["Netflix", "Amazon Prime", "Hotstar", "Spotify", "BookMyShow", "PVR"],
  Bills: ["Electricity Board", "Airtel Broadband", "Jio Recharge", "Water Bill", "Insurance Premium"],
  Lifestyle: ["Cult.fit", "Salon", "Nike", "Zara", "H&M"],
  Other: ["Miscellaneous", "Gift", "Donation"],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function generateMockTransactions(count = 60): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  // Income entries (first day of month)
  transactions.push({
    id: "mock-income-1",
    date: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    merchant: "Salary - Acme Corp",
    category: "Other",
    amount: 85000,
    type: "income",
    account_id: "mock-acc-001",
  });

  // Generate expense transactions over the past 30 days
  for (let i = 0; i < count; i++) {
    const day = now.getDate() - Math.floor(Math.random() * 30);
    const date = new Date(now.getFullYear(), now.getMonth(), Math.max(1, day));
    const cat = randomItem(categories);
    const merchant = randomItem(merchants[cat]);

    transactions.push({
      id: `mock-txn-${i + 1}`,
      date: formatDate(date),
      merchant,
      category: cat,
      amount: randomAmount(50, 8000),
      type: "expense",
      account_id: "mock-acc-001",
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function mockProfile() {
  return {
    currency: "₹",
    monthly_income: 85000,
    monthly_savings_target: 15000,
    full_name: "Test User",
    has_onboarded: true,
  };
}

export function mockBudgetExpectations() {
  return [
    { category: "Rent", expected_amount: 18000 },
    { category: "Groceries", expected_amount: 8000 },
    { category: "Food", expected_amount: 5000 },
    { category: "Transport", expected_amount: 4000 },
    { category: "Shopping", expected_amount: 5000 },
    { category: "Bills", expected_amount: 6000 },
    { category: "Entertainment", expected_amount: 3000 },
    { category: "Lifestyle", expected_amount: 4000 },
    { category: "Eating Out", expected_amount: 3000 },
  ];
}

export function mockRecurringBills() {
  return [
    { id: "mock-bill-1", name: "Netflix", amount: 649, frequency: "monthly", category: "Entertainment", last_paid_at: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: "mock-bill-2", name: "Amazon Prime", amount: 1499, frequency: "yearly", category: "Entertainment", last_paid_at: new Date(Date.now() - 60 * 86400000).toISOString() },
    { id: "mock-bill-3", name: "Airtel Broadband", amount: 999, frequency: "monthly", category: "Bills", last_paid_at: null },
    { id: "mock-bill-4", name: "Spotify Premium", amount: 119, frequency: "monthly", category: "Entertainment", last_paid_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: "mock-bill-5", name: "Cult.fit Pro", amount: 1999, frequency: "monthly", category: "Lifestyle", last_paid_at: null },
  ];
}

export function mockAccounts() {
  return [
    { id: "mock-acc-001", account_name: "HDFC Bank", account_type: "Savings", last_four: "1234", created_at: new Date().toISOString() },
  ];
}