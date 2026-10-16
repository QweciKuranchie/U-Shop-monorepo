"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Heart,
  Bell,
  TrendingUp,
  Clock,
  ArrowRight,
  User,
} from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
 } from "@repo/ui";
import {  Button  } from "@repo/ui";
import {  Badge  } from "@repo/ui";
import {  Separator  } from "@repo/ui";

interface UserStats {
  ordersCount: number;
  wishlistCount: number;
  notificationsCount: number;
  unreadNotifications: number;
  rewardPoints: number;
  walletBalance: number;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "order" | "notification" | "wishlist";
}

export default function UserDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats>({
    ordersCount: 0,
    wishlistCount: 0,
    notificationsCount: 0,
    unreadNotifications: 0,
    rewardPoints: 0,
    walletBalance: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user dashboard stats
        const response = await fetch("/api/user/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
            setRecentActivity(data.recentActivity);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "notification":
        return <Bell className="h-4 w-4 text-purple-500" />;
      case "wishlist":
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-pulse">
          <div className="space-y-4 mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100/70 rounded-xl">
              <User className="h-6 w-6 text-ushop-purple-dark" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-ushop-purple-dark">
                  Welcome back,{" "}
                  {user?.firstName ||
                    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
                    "User"}
                  !
                </h1>
              </div>
              <p className="text-gray-600 mt-1 text-sm">
                Here&apos;s what&apos;s happening with your account today
              </p>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-ushop-purple text-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-row items-center justify-between pb-3">
            <span className="text-sm font-medium">Total Orders</span>
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">{stats.ordersCount}</div>
            <p className="text-xs text-purple-100">Orders placed</p>
          </div>
        </div>

        <div className="bg-ushop-pink text-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-row items-center justify-between pb-3">
            <span className="text-sm font-medium">Notifications</span>
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              {stats.notificationsCount}
            </div>
            <p className="text-xs text-pink-100">
              {stats.unreadNotifications} unread
            </p>
          </div>
        </div>

        <div className="bg-gray-800 text-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-row items-center justify-between pb-3">
            <span className="text-sm font-medium">Wishlist</span>
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">{stats.wishlistCount}</div>
            <p className="text-xs text-gray-300">Items saved</p>
          </div>
        </div>
      </div>

      {/* Content Section with Proper Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-zinc-50/70 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-ushop-pink" />
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/notifications">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">Your latest account activity</p>

          <div className="pt-2">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ushop-purple-dark leading-tight">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    {index < recentActivity.slice(0, 5).length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-50/70 rounded-2xl p-6 space-y-4 h-fit">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-ushop-pink" />
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          </div>
          <p className="text-sm text-gray-500">Frequently used features</p>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <Link href="/user/orders">
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-white hover:bg-purple-50/60 border-gray-200/80 rounded-xl transition-colors"
              >
                <Package className="mr-3 h-4 w-4 text-blue-500" />
                <span className="font-medium text-gray-900">View Orders</span>
                <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
              </Button>
            </Link>

            <Link href="/user/notifications">
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-white hover:bg-purple-50/60 border-gray-200/80 rounded-xl transition-colors"
              >
                <Bell className="mr-3 h-4 w-4 text-purple-500" />
                <span className="font-medium text-gray-900">Notifications</span>
                {stats.unreadNotifications > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {stats.unreadNotifications}
                  </Badge>
                )}
                {stats.unreadNotifications === 0 && (
                  <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                )}
              </Button>
            </Link>

            <Link href="/wishlist">
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-white hover:bg-purple-50/60 border-gray-200/80 rounded-xl transition-colors"
              >
                <Heart className="mr-3 h-4 w-4 text-red-500" />
                <span className="font-medium text-gray-900">Wishlist</span>
                <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
              </Button>
            </Link>

            <Link href="/user/profile">
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-white hover:bg-purple-50/60 border-gray-200/80 rounded-xl transition-colors"
              >
                <User className="mr-3 h-4 w-4 text-green-500" />
                <span className="font-medium text-gray-900">Profile Settings</span>
                <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
