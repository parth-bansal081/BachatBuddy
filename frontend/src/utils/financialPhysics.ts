import { getDaysInMonth, getDate, endOfMonth, differenceInDays } from "date-fns";

export function getDaysData() {
    const now = new Date();
    const totalDaysInMonth = getDaysInMonth(now);
    const currentDay = getDate(now);
    // Remaining days, including today
    const remainingDays = differenceInDays(endOfMonth(now), now) + 1;
    const daysPassed = currentDay;

    return { now, totalDaysInMonth, currentDay, remainingDays, daysPassed };
}

// Logic: (Income - Goal) / 30 per User Request Task 4
export function calculateSafeToSpend(income: number, savingsGoal: number, totalSpent: number) {
    const { remainingDays } = getDaysData();
    // New Formula: Target Daily Spend (Static)
    // "For the ₹2,000 user with a ₹500 goal, the safe limit should automatically show as ₹50/day"
    const dailySafeAmount = (income - savingsGoal) / 30;

    // Available Funds for context (Dynamic)
    const availableFunds = Math.max(0, income - savingsGoal - totalSpent);

    return { dailySafeAmount, availableFunds, remainingDays };
}

// Logic: totalSpent / daysElapsed
export function calculateActualBurn(totalSpent: number) {
    const { daysPassed } = getDaysData();
    const actualBurnRate = daysPassed > 0 ? totalSpent / daysPassed : 0;
    return { actualBurnRate, daysPassed };
}
