import {
  X,
  User,
  ShoppingCart,
  Heart,
  Package,
  Phone,
  HelpCircle,
  Info,
  Logs,
  LogOut,
  Flame,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { FC, useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useOutsideClick } from "@/hooks";
import { headerData, categoriesData } from "@/Constants/data";
import { ClerkLoaded, SignedIn, SignedOut, SignOutButton, useAuth, useUser, UserButton } from "@clerk/nextjs";
import useStore from "@/store";
import Logo from "../common/Logo";
import SocialMediaIcons from "../common/SocialMediaIcons";
import { client } from "@repo/sanity";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface University {
  _id: string;
  name?: string;
  slug?: {
    current?: string;
  };
}

const DEFAULT_SIDEBAR_UNIVERSITIES: University[] = [
  { _id: "uni-legon", name: "University of Ghana (Legon)", slug: { current: "university-of-ghana-legon" } },
  { _id: "uni-knust", name: "KNUST", slug: { current: "knust-kumasi" } },
  { _id: "uni-ucc", name: "University of Cape Coast (UCC)", slug: { current: "university-of-cape-coast" } },
  { _id: "uni-gctu", name: "Ghana Communication Tech (GCTU)", slug: { current: "gctu-accra" } },
  { _id: "uni-umat", name: "University of Mines (UMaT)", slug: { current: "umat-tarkwa" } },
];

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  const { items, favoriteProduct } = useStore();
  const [universities, setUniversities] = useState<University[]>(DEFAULT_SIDEBAR_UNIVERSITIES);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await client.fetch(
          `*[_type in ['location', 'university'] && (type == 'university' || _type == 'university')] | order(name asc)`
        );
        const merged = DEFAULT_SIDEBAR_UNIVERSITIES.map((def) => {
          const key = (def.slug?.current || "").toLowerCase();
          const found = (data || []).find((d: { _id?: string; name?: string; slug?: { current?: string } }) => {
            const dSlug = (d.slug?.current || "").toLowerCase();
            const dName = (d.name || "").toLowerCase();
            return (
              dSlug === key ||
              dName.includes(def.name?.toLowerCase() || "") ||
              (key.includes("gctu") && (dSlug.includes("gctu") || dName.includes("gctu"))) ||
              (key.includes("ucc") && (dSlug.includes("ucc") || dName.includes("ucc"))) ||
              (key.includes("umat") && (dSlug.includes("umat") || dName.includes("umat"))) ||
              (key.includes("legon") && (dSlug.includes("legon") || dSlug.includes("ug"))) ||
              (key.includes("knust") && (dSlug.includes("knust") || dName.includes("knust")))
            );
          });
          return found ? { ...def, ...found } : def;
        });

        const extra = (data || []).filter(
          (d: { _id?: string; name?: string; slug?: { current?: string } }) =>
            !merged.some(
              (m) =>
                m._id === d._id ||
                (m.slug?.current && d.slug?.current && m.slug.current === d.slug.current)
            )
        );

        setUniversities([...merged, ...extra]);
      } catch (error) {
        console.error("Error fetching universities in SideMenu:", error);
        setUniversities(DEFAULT_SIDEBAR_UNIVERSITIES);
      }
    };
    fetchUniversities();
  }, []);

  // Enhanced menu sections with icons
  const userMenuItems = [
    { title: "My Profile", href: "/user/profile", icon: User },
    { title: "My Orders", href: "/user/orders", icon: Package },
    { title: "Wishlist", href: "/wishlist", icon: Heart },
    { title: "Shopping Cart", href: "/cart", icon: ShoppingCart },
  ];

  const supportMenuItems = [
    { title: "Help Center", href: "/help", icon: HelpCircle },
    { title: "Contact Us", href: "/contact", icon: Phone },
    { title: "About Us", href: "/about", icon: Info },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-y-0 left-0 z-[60] w-full bg-black/45 backdrop-blur-xs transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform ease-in-out duration-300`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        ref={sidebarRef}
        className="w-[85vw] max-w-sm bg-ushop_light_bg z-50 h-[100dvh] max-h-screen text-zinc-800 p-6 border-r border-r-ushop-purple/15 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-ushop-pink scrollbar-track-transparent shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80">
          <Logo className="text-black" />
          <button aria-label="Close menu"
            onClick={onClose}
            className="text-zinc-500 hover:text-ushop-pink hoverEffect p-2 rounded-lg hover:bg-ushop-pink/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Quick Actions */}
        <div className="space-y-3">
          <ClerkLoaded>
            <SignedOut>
              <div className="bg-ushop-purple/5 p-4 rounded-2xl border border-ushop-purple/10 mb-3 space-y-2.5">
                <h4 className="text-xs font-bold text-ushop-purple uppercase tracking-wider">
                  Welcome to UShop
                </h4>
                <p className="text-xs text-zinc-500 leading-normal">
                  Log in to access your orders, track purchases, and manage your wishlist.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    href="/sign-in"
                    onClick={onClose}
                    className="w-full text-center text-ushop-purple border border-ushop-purple/20 hover:border-ushop-pink hover:bg-ushop-pink hover:text-white px-4 py-2.5 rounded-xl hoverEffect font-semibold text-xs cursor-pointer bg-white shadow-xs block"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={onClose}
                    className="w-full text-center text-white bg-ushop-purple hover:bg-ushop-pink px-4 py-2.5 rounded-xl hoverEffect font-semibold text-xs cursor-pointer shadow-xs block"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="bg-ushop-purple/5 p-4 rounded-2xl border border-ushop-purple/10 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-ushop-purple">Welcome back!</span>
                    <span className="text-xs text-zinc-600 font-medium truncate max-w-[140px]">
                      {user?.fullName || user?.firstName || "My Account"}
                    </span>
                  </div>
                </div>
                <Link
                  href="/user/profile"
                  onClick={onClose}
                  className="text-xs font-semibold text-ushop-pink hover:underline"
                >
                  Profile &rarr;
                </Link>
              </div>
            </SignedIn>
          </ClerkLoaded>

          <div className={`grid gap-3 ${isSignedIn ? "grid-cols-3" : "grid-cols-2"}`}>
            {/* Shopping Cart */}
            <Link
              onClick={onClose}
              href="/cart"
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-ushop-purple/10 hover:bg-ushop-pink/10 hover:text-ushop-pink hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 text-center relative group"
            >
              <ShoppingCart size={20} className="text-ushop-pink" />
              <span className="text-xs font-medium text-zinc-600 group-hover:text-ushop-pink transition-colors duration-200">Cart</span>
              {items?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-ushop-purple text-white h-4 w-4 rounded-full text-xs font-semibold flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              onClick={onClose}
              href="/wishlist"
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-ushop-purple/10 hover:bg-ushop-pink/10 hover:text-ushop-pink hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 text-center relative group"
            >
              <Heart size={20} className="text-ushop-pink" />
              <span className="text-xs font-medium text-zinc-600 group-hover:text-ushop-pink transition-colors duration-200">
                Wishlist
              </span>
              {favoriteProduct?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-ushop-purple text-white h-4 w-4 rounded-full text-xs font-semibold flex items-center justify-center">
                  {favoriteProduct.length}
                </span>
              )}
            </Link>

            {/* Orders */}
            <ClerkLoaded>
              <SignedIn>
                <Link
                  onClick={onClose}
                  href="/user/orders"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-ushop-purple/10 hover:bg-ushop-pink/10 hover:text-ushop-pink hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 text-center group"
                >
                  <Logs size={20} className="text-ushop-pink" />
                  <span className="text-xs font-medium text-zinc-600 group-hover:text-ushop-pink transition-colors duration-200">
                    Orders
                  </span>
                </Link>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>

        {/* User Section */}
        <ClerkLoaded>
          <SignedIn>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ushop-purple uppercase tracking-wider">
                My Account
              </h3>
              <div className="flex flex-col gap-2">
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      onClick={onClose}
                      key={item.title}
                      href={item.href}
                      className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium tracking-wide border-l-2 transition-all duration-200 hover:text-ushop-pink hover:bg-ushop-pink/10 hover:border-ushop-pink group ${
                        pathname === item.href
                          ? "text-ushop-purple bg-ushop-purple/10 border-ushop-purple font-semibold"
                          : "text-zinc-600 border-transparent"
                      }`}
                    >
                      <Icon size={18} className="text-ushop-pink group-hover:text-ushop-pink transition-colors duration-200" />
                      {item.title}
                    </Link>
                  );
                })}
                <SignOutButton>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-md text-sm font-medium tracking-wide border-l-2 border-transparent transition-all duration-200 hover:text-ushop-pink hover:bg-ushop-pink/10 hover:border-ushop-pink text-zinc-600 w-full text-left group cursor-pointer"
                  >
                    <LogOut size={18} className="text-ushop-pink group-hover:text-ushop-pink transition-colors duration-200" />
                    Logout
                  </button>
                </SignOutButton>
              </div>
            </div>
          </SignedIn>
        </ClerkLoaded>

        {/* Main Navigation */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ushop-purple uppercase tracking-wider">
            Navigation
          </h3>
          <div className="flex flex-col gap-2">
            <Link
              onClick={onClose}
              href="/deals"
              className={`flex items-center justify-between p-2 rounded-md text-sm font-bold tracking-wide border-l-2 transition-all duration-200 hover:text-ushop-pink hover:bg-ushop-pink/10 hover:border-ushop-pink group ${
                pathname?.startsWith("/deals")
                  ? "text-ushop-red bg-red-50 border-ushop-red font-extrabold"
                  : "text-ushop-red border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame size={18} className="text-ushop-red fill-ushop-red animate-pulse" />
                <span>Deals & Offers</span>
              </div>
              <span className="px-1.5 py-0.5 bg-ushop-red text-white text-[9px] font-black rounded-md uppercase">
                HOT
              </span>
            </Link>

            {headerData.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  onClick={onClose}
                  key={item.title}
                  href={item.href}
                  className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium tracking-wide border-l-2 transition-all duration-200 hover:text-ushop-pink hover:bg-ushop-pink/10 hover:border-ushop-pink group ${
                    isActive
                      ? "text-ushop-purple bg-ushop-purple/10 border-ushop-purple font-semibold"
                      : "text-zinc-600 border-transparent"
                  }`}
                >
                  {Icon && (
                    <Icon size={18} className="text-ushop-pink group-hover:text-ushop-pink transition-colors duration-200" />
                  )}
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ushop-purple uppercase tracking-wider">
            Popular Categories
          </h3>
          <div className="flex flex-col gap-1">
            {categoriesData.links
              .filter((item) => item.href !== "/category" && item.title.toLowerCase() !== "all categories")
              .slice(0, 6)
              .map((item) => (
                <Link
                  onClick={onClose}
                  key={item.title}
                  href={`/shop?category=${item.href.replace(/^\//, "")}`}
                  className="text-xs font-medium text-zinc-600 hover:text-ushop-pink transition-colors duration-200 py-1.5 px-2 rounded hover:bg-ushop-pink/10 capitalize"
                >
                  {item.title}
                </Link>
              ))}
            <Link
              onClick={onClose}
              href="/category"
              className="text-xs font-semibold text-ushop-purple hover:text-ushop-pink transition-colors duration-200 py-1.5 px-2 rounded hover:bg-ushop-pink/10 mt-1"
            >
              View All Categories →
            </Link>
          </div>
        </div>

        {/* Universities Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ushop-purple uppercase tracking-wider">
            Universities
          </h3>
          <div className="flex flex-col gap-1">
            {universities.slice(0, 6).map((item) => (
              <Link
                onClick={onClose}
                key={item._id}
                href={`/universities/${item.slug?.current}`}
                className="text-xs font-medium text-zinc-600 hover:text-ushop-pink transition-colors duration-200 py-1.5 px-2 rounded hover:bg-ushop-pink/10 capitalize"
              >
                {item.name}
              </Link>
            ))}
            <Link
              onClick={onClose}
              href="/universities"
              className="text-xs font-semibold text-ushop-purple hover:text-ushop-pink transition-colors duration-200 py-1.5 px-2 rounded hover:bg-ushop-pink/10 mt-1"
            >
              View All Universities →
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ushop-purple uppercase tracking-wider">
            Support
          </h3>
          <div className="flex flex-col gap-2">
            {supportMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  onClick={onClose}
                  key={item.title}
                  href={item.href}
                  className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium tracking-wide border-l-2 transition-all duration-200 hover:text-ushop-pink hover:bg-ushop-pink/10 hover:border-ushop-pink group ${
                    pathname === item.href
                      ? "text-ushop-purple bg-ushop-purple/10 border-ushop-purple font-semibold"
                      : "text-zinc-600 border-transparent"
                  }`}
                >
                  <Icon size={18} className="text-ushop-pink group-hover:text-ushop-pink transition-colors duration-200" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ushop-purple/20 my-2"></div>

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-ushop-purple-dark to-ushop-purple rounded-lg p-4 text-center">
          <h4 className="text-sm font-bold text-white mb-1">
            Special Offer!
          </h4>
          <p className="text-xs text-zinc-300 mb-2">
            Get 20% off on your first order
          </p>
          <Link
            onClick={onClose}
            href="/deals"
            className="inline-block text-xs font-semibold text-ushop-purple bg-white hover:bg-ushop-pink hover:text-white px-4 py-1.5 rounded-full transition-colors duration-200 shadow-sm"
          >
            Shop Now
          </Link>
        </div>

        {/* Social Media */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-ushop-purple uppercase tracking-wider mb-3">
            Follow Us
          </h3>
          <SocialMediaIcons />
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;


