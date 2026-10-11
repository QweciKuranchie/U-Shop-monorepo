import { defineQuery } from "next-sanity";

export const SELLER_STORE_QUERY = defineQuery(
  `*[_type == "store" && (supabaseUserId == $userId || clerkUserId == $userId)][0]{ _id, name, status, sellerType }`
);

export const SELLER_PRODUCTS_COUNT_QUERY = defineQuery(
  `count(*[_type == "product" && store._ref == $storeId])`
);

// Orders store their lines in `items[]` (see orderType). "Belongs to a seller"
// means at least one line's product is in that seller's store.
export const SELLER_ORDERS_COUNT_QUERY = defineQuery(
  `count(*[_type == "order" && count(items[product->store._ref == $storeId]) > 0])`
);

export const SELLER_LISTINGS_QUERY = defineQuery(
  `*[_type == "product" && store._ref == $storeId] | order(_updatedAt desc)`
);

// Orders containing at least one of the seller's products. Only the seller's own
// lines are returned, so a seller never sees other sellers' items or order totals.
export const SELLER_ORDERS_QUERY = defineQuery(
  `*[_type == "order" && count(items[product->store._ref == $storeId]) > 0]
   | order(_createdAt desc)[0...200]{
     _id, _createdAt, orderNumber, customerName, orderStatus, paymentStatus,
     "sellerItems": items[product->store._ref == $storeId]{
       quantity, price, "productName": product->name
     }
   }`
);

// One order, scoped the same way. Null when the order has none of the seller's products.
export const SELLER_ORDER_DETAIL_QUERY = defineQuery(
  `*[_type == "order" && _id == $orderId && count(items[product->store._ref == $storeId]) > 0][0]{
     _id, _createdAt, orderNumber, customerName, email, orderStatus, paymentStatus,
     "sellerItems": items[product->store._ref == $storeId]{
       quantity, price, "productName": product->name
     }
   }`
);

// Verifies a single order belongs to the seller's store (used for PATCH ownership check)
export const SELLER_ORDER_OWNERSHIP_QUERY = defineQuery(
  `*[_type == "order" && _id == $orderId && count(items[product->store._ref == $storeId]) > 0][0]{ _id }`
);
