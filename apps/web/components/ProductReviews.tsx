"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StarIcon,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Plus,
  Loader2,
  Store,
} from "lucide-react";
import {  Button  } from "@repo/ui";
import ReviewSidebar from "@/components/ReviewSidebar";
import {
  getProductReviewsAPI,
  markReviewHelpfulAPI,
  ProductReviewsData,
} from "@/lib/reviewAPI";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface Review {
  _id: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  isVerifiedPurchase: boolean;
  sellerReply?: { text?: string; repliedAt?: string } | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: {
      asset: {
        url: string;
      };
    };
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialReviews?: Review[];
}

const SORTS = [
  { value: "recent", label: "Most recent" },
  { value: "helpful", label: "Most helpful" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
] as const;
type SortValue = (typeof SORTS)[number]["value"];

const ProductReviews = React.memo(
  ({ productId, productName, initialReviews }: ProductReviewsProps) => {
    const { isSignedIn } = useUser();
    const [reviews, setReviews] = useState<Review[]>(
      initialReviews && initialReviews.length > 0 ? initialReviews : []
    );
    const [stats, setStats] = useState<ProductReviewsData | null>(null);
    const [helpfulRatings, setHelpfulRatings] = useState<Record<string, number>>({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const [sort, setSort] = useState<SortValue>("recent");
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const loadReviews = useCallback(async () => {
      if (!productId) return;
      setIsLoading(true);
      try {
        const data = await getProductReviewsAPI(productId);
        if (data) {
          setStats(data);
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }, [productId]);

    useEffect(() => {
      loadReviews();
    }, [loadReviews]);

    const handleMarkHelpful = useCallback(
      async (reviewId: string) => {
        if (!isSignedIn) {
          toast.error("Please sign in to mark reviews as helpful");
          return;
        }

        const isCurrentlyMarked = helpfulRatings[reviewId];

        // Optimistic UI update
        setHelpfulRatings((prev) => ({
          ...prev,
          [reviewId]: isCurrentlyMarked ? 0 : 1,
        }));
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  helpful: isCurrentlyMarked
                    ? Math.max(0, r.helpful - 1)
                    : r.helpful + 1,
                }
              : r
          )
        );

        try {
          const res = await markReviewHelpfulAPI(reviewId);
          if (res.success) {
            toast.success(res.message);
          } else {
            toast.error(res.message);
            // Revert optimistic update
            setHelpfulRatings((prev) => ({
              ...prev,
              [reviewId]: isCurrentlyMarked ? 1 : 0,
            }));
            setReviews((prev) =>
              prev.map((r) =>
                r._id === reviewId
                  ? {
                      ...r,
                      helpful: isCurrentlyMarked
                        ? r.helpful + 1
                        : Math.max(0, r.helpful - 1),
                    }
                  : r
              )
            );
          }
        } catch (error) {
          console.error("Error marking helpful:", error);
          toast.error("Failed to update review helpful status");
        }
      },
      [isSignedIn, helpfulRatings]
    );

    const averageRating =
      stats?.averageRating ??
      (reviews.length > 0
        ? parseFloat(
            (
              reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            ).toFixed(1)
          )
        : 0);

    const totalReviews = stats?.totalReviews ?? reviews.length;

    const distribution = stats?.ratingDistribution ?? {
      fiveStars: reviews.filter((r) => r.rating === 5).length,
      fourStars: reviews.filter((r) => r.rating === 4).length,
      threeStars: reviews.filter((r) => r.rating === 3).length,
      twoStars: reviews.filter((r) => r.rating === 2).length,
      oneStar: reviews.filter((r) => r.rating === 1).length,
    };

    const verifiedCount = reviews.filter((r) => r.isVerifiedPurchase).length;

    const visibleReviews = useMemo(() => {
      const filtered = ratingFilter ? reviews.filter((r) => r.rating === ratingFilter) : reviews;
      const byDate = (a: Review, b: Review) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return [...filtered].sort((a, b) => {
        if (sort === "helpful") return (b.helpful || 0) - (a.helpful || 0) || byDate(a, b);
        if (sort === "highest") return b.rating - a.rating || byDate(a, b);
        if (sort === "lowest") return a.rating - b.rating || byDate(a, b);
        return byDate(a, b);
      });
    }, [reviews, sort, ratingFilter]);

    return (
      <div className="space-y-8 mt-12 pt-12 border-t border-gray-100">
        {/* Header with Title & Action Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Customer Reviews
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Read what buyers are saying about {productName}
            </p>
          </div>

          <Button
            onClick={() => {
              if (!isSignedIn) {
                toast.error("Please sign in to write a review");
                return;
              }
              setIsSidebarOpen(true);
            }}
            className="bg-ushop-purple hover:bg-ushop-purple-dark text-white font-bold rounded-xl shadow-xs hoverEffect self-start flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </Button>
        </div>

        {/* Rating Breakdown / Summary Card */}
        {totalReviews > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-purple-50/20 border border-gray-100 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Overall Rating */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start justify-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 my-2" role="img" aria-label={`Average rating ${averageRating.toFixed(1)} out of 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    aria-hidden="true"
                    size={18}
                    className={
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-gray-500">
                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                {verifiedCount > 0 && ` (${verifiedCount} verified ${verifiedCount === 1 ? "purchase" : "purchases"})`}
              </div>
            </div>

            {/* Distribution Bar Chart */}
            <div className="md:col-span-2 space-y-2">
              {[
                { stars: 5, count: distribution.fiveStars },
                { stars: 4, count: distribution.fourStars },
                { stars: 3, count: distribution.threeStars },
                { stars: 2, count: distribution.twoStars },
                { stars: 1, count: distribution.oneStar },
              ].map(({ stars, count }) => {
                const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const active = ratingFilter === stars;
                return (
                  <button
                    type="button"
                    key={stars}
                    disabled={count === 0}
                    aria-pressed={active}
                    aria-label={`${stars} star reviews: ${count}. ${active ? "Clear filter" : "Show only these"}`}
                    onClick={() => { setRatingFilter(active ? null : stars); setVisibleCount(5); }}
                    className={`flex w-full items-center gap-3 text-xs rounded-md px-1 py-0.5 text-left disabled:opacity-50 disabled:cursor-default ${active ? "bg-yellow-50 ring-1 ring-yellow-300" : "hover:bg-white/70"}`}
                  >
                    <span className="w-12 text-gray-600 font-medium flex items-center gap-1">
                      {stars} <StarIcon aria-hidden="true" size={12} className="fill-yellow-400 text-yellow-400" />
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-gray-500 font-semibold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Review List */}
        <div className="space-y-4">
          {isLoading && reviews.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-ushop-purple" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <MessageSquare className="mx-auto text-gray-300 mb-3" size={36} />
              <h3 className="font-bold text-gray-800 text-base">No reviews yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Have you purchased this product? Be the first to share your experience with other shoppers!
              </p>
              <Button
                onClick={() => {
                  if (!isSignedIn) {
                    toast.error("Please sign in to write a review");
                    return;
                  }
                  setIsSidebarOpen(true);
                }}
                className="mt-4 bg-ushop-purple hover:bg-ushop-purple-dark text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Write First Review
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-500" aria-live="polite">
                  {ratingFilter
                    ? `Showing ${visibleReviews.length} ${ratingFilter}-star ${visibleReviews.length === 1 ? "review" : "reviews"}`
                    : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
                  {ratingFilter && (
                    <button type="button" className="ml-2 underline text-ushop-purple" onClick={() => setRatingFilter(null)}>
                      Clear filter
                    </button>
                  )}
                </p>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  Sort by
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value as SortValue); setVisibleCount(5); }}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs"
                  >
                    {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>
              {visibleReviews.slice(0, visibleCount).map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-ushop-purple/20 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ushop-purple/10 to-ushop-pink/10 flex items-center justify-center font-bold text-ushop-purple-dark uppercase text-sm border border-ushop-purple/10">
                        {review.user?.firstName ? review.user.firstName[0] : "U"}
                        {review.user?.lastName ? review.user.lastName[0] : ""}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {review.user?.firstName || "Anonymous"}{" "}
                          {review.user?.lastName || ""}
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          aria-hidden="true"
                          size={14}
                          className={
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-bold text-gray-900 text-sm">
                      {review.title}
                    </h5>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {review.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                      {review.isVerifiedPurchase && (
                        <>
                          <ShieldCheck size={15} className="text-emerald-600" />
                          <span>Verified Purchase</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleMarkHelpful(review._id)}
                      aria-pressed={Boolean(helpfulRatings[review._id])}
                      className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-3 rounded-full border transition-all ${
                        helpfulRatings[review._id]
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                          : "bg-white border-gray-200 hover:border-ushop-pink hover:text-ushop-pink text-gray-600 hoverEffect"
                      }`}
                    >
                      <ThumbsUp size={12} />
                      <span>Helpful ({review.helpful || 0})</span>
                    </button>
                  </div>

                  {review.sellerReply?.text && (
                    <div className="mt-4 rounded-xl bg-purple-50/60 border border-purple-100 p-4">
                      <p className="text-xs font-bold text-ushop-purple-dark flex items-center gap-1.5">
                        <Store size={13} aria-hidden="true" /> Response from the seller
                        {review.sellerReply.repliedAt && (
                          <span className="font-normal text-gray-400">
                            · {new Date(review.sellerReply.repliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {review.sellerReply.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {visibleReviews.length > visibleCount && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="text-xs font-bold rounded-xl border-gray-200 hover:border-ushop-purple text-gray-700"
                  >
                    Load More Reviews ({visibleReviews.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Review Submission Sidebar */}
        <ReviewSidebar
          productId={productId}
          productName={productName}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onReviewSubmitted={() => {
            loadReviews();
          }}
        />
      </div>
    );
  }
);

ProductReviews.displayName = "ProductReviews";

export default ProductReviews;
