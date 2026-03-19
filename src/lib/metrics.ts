import { getDaysInMonth, getDate, endOfMonth, differenceInDays } from "date-fns";

export function getDaysData() {
    const now = new Date();
    const totalDaysInMonth = getDaysInMonth(now);
    const currentDay = getDate(now);
    // Remaining days, including today, matching Dashboard logic
    const remainingDays = differenceInDays(endOfMonth(now), now) + 1;

    // Days passed (excluding today effectively for average calculation, or including? 
    // Usually "current day" is 1-indexed. So days passed is currentDay.)
    const daysPassed = currentDay;

    return { now, totalDaysInMonth, currentDay, remainingDays, daysPassed };
}

export function calculateSafeToSpend(income: number, savingsGoal: number, totalSpent: number) {
    const { remainingDays } = getDaysData();
    const availableFunds = Math.max(0, income - savingsGoal - totalSpent);
    // Daily safe amount
    const dailySafeAmount = remainingDays > 0 ? availableFunds / remainingDays : 0;
    return { dailySafeAmount, availableFunds, remainingDays };
}

export function calculateDailyBurnRate(totalSpent: number) {
    const { daysPassed } = getDaysData();
    // Calculate velocity based on days passed in current month
    return daysPassed > 0 ? totalSpent / daysPassed : 0;
}
