/** Stock at or below this level is flagged "Low stock" (matches the dashboard to-do list). */
export const LOW_STOCK_THRESHOLD = 5;

export const isLowStock = (stock: number | null | undefined): boolean =>
  (stock ?? 0) <= LOW_STOCK_THRESHOLD;
