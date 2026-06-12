export const BACHAT_GREEN = "#14b8a6";
export const BG_DARK = "#0f172a";

export const CHART_COLORS = [
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#10b981", // emerald
  "#f97316", // orange
  "#6366f1", // indigo
];

export function useThreeTheme() {
  return {
    primary: BACHAT_GREEN,
    background: BG_DARK,
    chartColors: CHART_COLORS,
  };
}