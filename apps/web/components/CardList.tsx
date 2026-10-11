/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle, Badge } from "@repo/ui";
import { client } from "@repo/sanity";
import { OrderType, ProductsType } from "@/types/admin";

const getPopularProducts = async (): Promise<ProductsType> => {
  try {
    const products = await client.fetch(
      `*[_type == "product"] | order(views desc, _createdAt desc)[0...5] {
        _id,
        name,
        price,
        "imageUrl": image.asset->url,
        "images": images[].asset->url,
        colors
      }`
    );

    return products.map((p: any) => {
      const fallback = p.imageUrl || (Array.isArray(p.images) && p.images[0]) || "";
      return {
        id: p._id,
        _id: p._id,
        name: p.name || "Product",
        price: p.price || 0,
        sizes: [],
        colors: p.colors || [],
        images: { default: fallback },
      };
    });
  } catch (error) {
    console.error("Error fetching popular products for CardList:", error);
    return [];
  }
};

const getLatestOrders = async (): Promise<OrderType[]> => {
  try {
    const orders = await client.fetch(
      `*[_type == "order"] | order(orderDate desc, _createdAt desc)[0...5] {
        _id,
        customerEmail,
        email,
        orderStatus,
        totalPrice,
        amount
      }`
    );

    return orders.map((ord: any) => ({
      _id: ord._id,
      id: ord._id,
      email: ord.customerEmail || ord.email || "customer@example.com",
      status: ord.orderStatus || "pending",
      amount: ord.totalPrice !== undefined ? ord.totalPrice * 100 : (ord.amount || 0),
    }));
  } catch (error) {
    console.error("Error fetching latest orders for CardList:", error);
    return [];
  }
};

const CardList = async ({ title }: { title: string }) => {
  const isProducts = title === "Popular Products";
  const products = isProducts ? await getPopularProducts() : [];
  const orders = !isProducts ? await getLatestOrders() : [];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">{title}</h1>
      <div className="flex flex-col gap-2">
        {isProducts ? (
          products.length > 0 ? (
            products.map((item) => {
              const imgSrc =
                typeof item.images === "object"
                  ? Object.values(item.images as Record<string, string>)[0] || "/placeholder.png"
                  : "/placeholder.png";

              return (
                <Card
                  key={item.id}
                  className="flex flex-row items-center justify-between gap-4 p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-md relative overflow-hidden bg-muted flex-shrink-0">
                    {imgSrc && imgSrc !== "/placeholder.png" ? (
                      <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-0 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {item.name}
                    </CardTitle>
                  </CardContent>
                  <CardFooter className="p-0 font-semibold text-sm">
                    ${item.price}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No products found</p>
          )
        ) : orders.length > 0 ? (
          orders.map((item: any) => (
            <Card
              key={item._id}
              className="flex flex-row items-center justify-between gap-4 p-3 hover:bg-accent/50 transition-colors"
            >
              <CardContent className="flex-1 p-0 min-w-0 space-y-1">
                <CardTitle className="text-sm font-medium truncate">
                  {item.email}
                </CardTitle>
                <div>
                  <Badge
                    variant={
                      item.status === "paid" || item.status === "success" || item.status === "delivered"
                        ? "default"
                        : "secondary"
                    }
                    className="text-[10px] px-1.5 py-0 capitalize"
                  >
                    {item.status}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-0 font-semibold text-sm">
                ${(item.amount / 100).toFixed(2)}
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No transactions recorded</p>
        )}
      </div>
    </div>
  );
};

export default CardList;
