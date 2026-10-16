"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { ServerCartContent } from "./ServerCartContent";
import { CartSkeleton } from "./CartSkeleton";
import { trackCartView } from "@/lib/analytics";
import NoAccessToCart from "@/components/NoAccessToCart";

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface UserOrder {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
  orderStatus: string;
  orderDate: string;
  customerName: string;
  email: string;
}

interface UserData {
  addresses: Address[];
  orders: UserOrder[];
}

export function ClientCartContent() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!isLoaded || !user) return;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      setError("Email not found. Please contact support.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token = await getToken().catch(() => null);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch user data from API endpoint
      const response = await fetch(
        `/api/user-data?email=${encodeURIComponent(userEmail)}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user, getToken]);

  const refreshAddresses = async () => {
    if (!user) return;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return;

    try {
      const token = await getToken().catch(() => null);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Only fetch addresses to refresh them
      const response = await fetch(
        `/api/user-data?email=${encodeURIComponent(userEmail)}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh addresses");
      }

      const data = await response.json();
      setUserData((prev) =>
        prev ? { ...prev, addresses: data.addresses } : data
      );
    } catch (err) {
      console.error("Failed to refresh addresses:", err);
      // Don't show error toast for refresh failures
    }
  };

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchUserData();
    });
    // Track cart view
    if (user) {
      trackCartView(user.id);
    }
    return () => {
      active = false;
    };
  }, [user, fetchUserData]);

  if (!isLoaded) {
    return <CartSkeleton />;
  }

  if (!user) {
    return (
      <NoAccessToCart details="Log in to view your cart items, saved delivery addresses, and checkout. Don't miss out on your favorite products!" />
    );
  }

  if (loading) {
    return <CartSkeleton />;
  }

  if (error && (!userData || (((userData.addresses || []).length === 0) && ((userData.orders || []).length === 0)))) {
    console.error("Cart content error:", error);
  }

  const userEmail = user.emailAddresses[0]?.emailAddress || "";

  return (
    <ServerCartContent
      userEmail={userEmail}
      userAddresses={userData?.addresses || []}
      userOrders={userData?.orders || []}
      onAddressesRefresh={refreshAddresses}
    />
  );
}
