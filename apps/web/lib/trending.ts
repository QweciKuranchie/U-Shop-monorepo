/** Products type `averageRating` as optional; Sanity can also return null, so accept both. */
type Rated = { averageRating?: number | null; rating?: number | null };

/**
 * Highest-rated first, then the first `limit`. The page used to sort on `p.rating`,
 * a field products do not have (they have `averageRating`), so every product scored 0
 * and "Top Rated" was simply the first ten in list order. Falls back to `rating` so
 * data that does carry it keeps working. Array#sort is stable, so ties keep list order.
 */
export function topRated<T extends Rated>(products: readonly T[], limit = 10): T[] {
  const score = (p: Rated) => p.averageRating || p.rating || 0;
  return [...products].sort((a, b) => score(b) - score(a)).slice(0, limit);
}
