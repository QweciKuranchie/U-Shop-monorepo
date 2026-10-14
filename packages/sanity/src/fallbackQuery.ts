/**
 * Bounded replacement for loading the ENTIRE catalogue to take its first few items.
 *
 * `getPopularProducts` used to fall back to `ALL_PRODUCTS_QUERY` (every product, every
 * field) and then `.slice(0, quantity)` when nothing qualified as "popular". Same
 * ordering and same projection, but the slice happens in Sanity, so only `$limit`
 * documents are ever fetched. Kept free of framework imports so it can be executed in
 * unit tests against in-memory data.
 */
export const FIRST_PRODUCTS_QUERY = `*[_type == "product"] | order(name asc) [0...$limit]{
    ...,
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`;
