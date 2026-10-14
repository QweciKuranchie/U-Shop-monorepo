import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { Product } from "@repo/sanity";
import { getDealProducts, getAllProducts } from "@repo/sanity/queries";
import {
  Zap,
  GraduationCap,
  Tag,
  ShoppingBag,
  Flame,
  LucideIcon,
} from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import SingleDealClient from "@/components/deals/SingleDealClient";

type Props = {
  params: Promise<{ slug: string }>;
};

const DEAL_CATEGORIES: Record<
  string,
  {
    title: string;
    subtitle: string;
    badgeText: string;
    maxDiscount: string;
    bgGradient: string;
    iconName: string;
  }
> = {
  flash: {
    title: "Flash Sales",
    subtitle: "Limited-time lightning deals with massive price drops up to 90% off. Grab yours before stock runs out!",
    badgeText: "Flash sale: up to 90% off",
    maxDiscount: "Up to 90% OFF",
    bgGradient: "bg-ushop-red",
    iconName: "zap",
  },
  students: {
    title: "Student Deals",
    subtitle: "Verified campus deals on laptops, smartphones, and accessories for university students across Ghana.",
    badgeText: "Student deals: up to 90% off",
    maxDiscount: "Up to 90% OFF",
    bgGradient: "bg-emerald-700",
    iconName: "graduation-cap",
  },
  clearance: {
    title: "Clearance Sale",
    subtitle: "Final markdown on warehouse stock and last-chance items with discounts up to 50% off.",
    badgeText: "Clearance: up to 50% off",
    maxDiscount: "Up to 50% OFF",
    bgGradient: "bg-amber-600",
    iconName: "tag",
  },
  "black-friday": {
    title: "Black Friday Mega Deals",
    subtitle: "The biggest shopping event of the year! Enjoy doorbuster discounts across all departments.",
    badgeText: "BLACK FRIDAY MEGA DEALS",
    maxDiscount: "Up to 90% OFF",
    bgGradient: "bg-gray-950",
    iconName: "shopping-bag",
  },
  "special-offers": {
    title: "Special Offers",
    subtitle: "Curated seasonal discounts, merchant bundle deals, and exclusive promotional pricing.",
    badgeText: "SPECIAL PROMOTIONAL OFFERS",
    maxDiscount: "Exclusive Deals",
    bgGradient: "bg-purple-800",
    iconName: "flame",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealInfo = DEAL_CATEGORIES[slug.toLowerCase()];

  if (!dealInfo) {
    return {
      title: "Deals | UShop",
    };
  }

  return {
    title: `${dealInfo.title} | ${dealInfo.maxDiscount} | UShop`,
    description: dealInfo.subtitle,
  };
}

const SingleDealCategoryPage = async ({ params }: Props) => {
  const { slug } = await params;
  const dealKey = slug.toLowerCase();
  const dealInfo = DEAL_CATEGORIES[dealKey];

  if (!dealInfo) {
    return notFound();
  }

  // Fetch deal products and all products fallback
  const [dealProducts, allProducts] = await Promise.all([
    getDealProducts(),
    getAllProducts(),
  ]);

  const rawProducts = (dealProducts && dealProducts.length > 0 ? dealProducts : allProducts) as unknown as Product[];

  // Filter products relevant to the deal category
  let filteredProducts: Product[] = [];

  if (dealKey === "flash") {
    filteredProducts = rawProducts.filter((p) => p.isFlashSale || p.status === "hot" || (p.discount && p.discount >= 20));
  } else if (dealKey === "students") {
    filteredProducts = rawProducts.filter((p) => Boolean(p.discount || p.isFlashSale || p.featured));
  } else if (dealKey === "clearance") {
    filteredProducts = rawProducts.filter((p) => (p.discount && p.discount > 0) || (p.status as string) === "refurbished" || p.status === "good");
  } else if (dealKey === "black-friday") {
    filteredProducts = rawProducts.filter((p) => Boolean(p.discount || p.isFlashSale || p.status === "hot"));
  } else {
    filteredProducts = rawProducts.filter((p) => Boolean(p.discount || p.featured || p.isFlashSale));
  }

  // If filtered set is small, fallback to all available deal products
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : rawProducts;

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Deals", href: "/deals" },
            { label: dealInfo.title, href: `/deals/${slug}` },
          ]}
        />

        {/* Single Deal Client with Countdown rules, Flash tabs, and Product Filters */}
        <SingleDealClient
          slug={dealKey}
          dealInfo={dealInfo}
          initialProducts={displayProducts}
        />
      </Container>
    </div>
  );
};

export default SingleDealCategoryPage;
