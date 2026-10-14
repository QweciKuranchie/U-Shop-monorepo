import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { Product } from "@repo/sanity";
import { getDealProducts } from "@repo/sanity/queries";
import { getFallbackProducts } from "@/lib/catalogFallback";
import { pickDisplayProducts } from "@/lib/deals";
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
    badgeText: "FLASH SALE — UP TO 90% OFF",
    maxDiscount: "Up to 90% OFF",
    bgGradient: "from-ushop-red via-red-600 to-amber-600",
    iconName: "zap",
  },
  students: {
    title: "Student Deals",
    subtitle: "Verified campus deals on laptops, smartphones, and accessories for university students across Ghana.",
    badgeText: "STUDENT SPECIALS — UP TO 90% OFF",
    maxDiscount: "Up to 90% OFF",
    bgGradient: "from-emerald-700 via-teal-600 to-ushop-pink",
    iconName: "graduation-cap",
  },
  clearance: {
    title: "Clearance Sale",
    subtitle: "Final markdown on warehouse stock and last-chance items with discounts up to 50% off.",
    badgeText: "CLEARANCE — UP TO 50% OFF",
    maxDiscount: "Up to 50% OFF",
    bgGradient: "from-amber-600 via-orange-600 to-red-600",
    iconName: "tag",
  },
  "black-friday": {
    title: "Black Friday Mega Deals",
    subtitle: "The biggest shopping event of the year! Enjoy doorbuster discounts across all departments.",
    badgeText: "BLACK FRIDAY MEGA DEALS",
    maxDiscount: "Up to 90% OFF",
    bgGradient: "from-gray-950 via-gray-900 to-ushop-red",
    iconName: "shopping-bag",
  },
  "special-offers": {
    title: "Special Offers",
    subtitle: "Curated seasonal discounts, merchant bundle deals, and exclusive promotional pricing.",
    badgeText: "SPECIAL PROMOTIONAL OFFERS",
    maxDiscount: "Exclusive Deals",
    bgGradient: "from-purple-800 via-pink-700 to-amber-600",
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

  // The deal set is the source of truth. General products are only needed when there
  // are NO deals at all, and then just one bounded page: this used to load the entire
  // catalogue (getAllProducts) on every request, even when it was never used.
  const dealProducts = (await getDealProducts()) as unknown as Product[];
  const rawProducts =
    dealProducts && dealProducts.length > 0 ? dealProducts : (await getFallbackProducts()).products;

  // Products relevant to this deal type; everything we have if none match.
  const displayProducts = pickDisplayProducts(dealKey, rawProducts);

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
