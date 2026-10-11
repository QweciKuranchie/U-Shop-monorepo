import { getHomepageGridProducts } from "@repo/sanity/queries";
import ProductGridClient from "./ProductGridClient";

/** Server component: products are fetched on the server and streamed in the page HTML. */
const ProductGrid = async () => {
  const products = await getHomepageGridProducts();
  return <ProductGridClient products={products} />;
};

export default ProductGrid;
