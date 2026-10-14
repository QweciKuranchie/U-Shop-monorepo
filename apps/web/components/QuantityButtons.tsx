import { Button } from "@repo/ui";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { toast } from "sonner";
import useCartStore from "@/store";
import { Product } from "@repo/sanity";
import { twMerge } from "tailwind-merge";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";

interface Props {
  product: Product;
  className?: string;
  borderStyle?: string;
}

const QuantityButtons = ({ product, className, borderStyle }: Props) => {
  const { addItem, removeItem, getItemCount } = useCartStore();
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  const handleRemoveProduct = () => {
    removeItem(product?._id);
    if (itemCount > 1) {
      toast.success("Quantity Decreased successfully!");
    } else {
      toast.success(`${product?.name?.substring(0, 12)} removed successfully!`);
    }
    // Firebase Analytics event
    trackRemoveFromCart({
      productId: product._id,
      name: product.name || "Unknown",
      price: product.price ?? 0,
      quantity: itemCount - 1,
    });
  };

  const handleAddToCart = () => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success("Quantity Increased successfully!");
      // Firebase Analytics event
      trackAddToCart({
        productId: product._id,
        name: product.name || "Unknown",
        price: product.price ?? 0,
        quantity: itemCount + 1,
      });
    } else {
      toast.error("Can not add more than available stock");
    }
  };
  return (
    <div
      className={twMerge(
        "flex items-center gap-1 pb-1 text-base",
        borderStyle,
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        title="Decrease quantity"
        aria-label="Decrease quantity"
        className="w-10 h-10 sm:w-8 sm:h-8 border-0 hover:bg-shop_dark_green/20 touch-manipulation cursor-pointer"
        onClick={handleRemoveProduct}
        disabled={itemCount === 0 || isOutOfStock}
      >
        <HiMinus />
      </Button>
      <span className="font-semibold text-sm min-w-6 text-center text-dark-color">
        {itemCount}
      </span>
      <Button
        variant="outline"
        size="icon"
        title="Increase quantity"
        aria-label="Increase quantity"
        className="w-10 h-10 sm:w-8 sm:h-8 border-0 hover:bg-shop_dark_green/20 touch-manipulation cursor-pointer"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        <HiPlus />
      </Button>
    </div>
  );
};

export default QuantityButtons;
