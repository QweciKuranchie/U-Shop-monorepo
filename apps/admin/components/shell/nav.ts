import {
  LayoutDashboard,
  Shirt,
  Boxes,
  SlidersHorizontal,
  Tags,
  ShoppingBasket,
  User,
  Store,
  Image as ImageIcon,
  BarChart3,
  FileText,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

/** Sidebar structure. URLs use /admin, which next.config rewrites to /dashboard. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    links: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "E-commerce",
    links: [
      { name: "Products", href: "/admin/products", icon: Shirt },
      { name: "Inventory", href: "/admin/inventory", icon: Boxes },
      { name: "Attributes", href: "/admin/attributes", icon: SlidersHorizontal },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Orders", href: "/admin/orders", icon: ShoppingBasket },
      { name: "Users", href: "/admin/users", icon: User },
      { name: "Sellers & KYC", href: "/admin/sellers", icon: Store },
      { name: "Homepage", href: "/admin/homepage", icon: ImageIcon },
    ],
  },
  {
    title: "Stats",
    links: [
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Reports", href: "/admin/reports", icon: FileText },
      { name: "Activity logs", href: "/admin/logs", icon: ScrollText },
    ],
  },
];
