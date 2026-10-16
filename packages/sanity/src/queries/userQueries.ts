 
import { sanityFetch } from "../live";

// User Queries
export const USER_BY_CLERK_ID_QUERY = `
  *[_type == "user" && clerkUserId == $clerkUserId][0] {
    _id,
    _type,
    clerkUserId,
    email,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    profileImage {
      asset -> {
        _id,
        url
      }
    },
    addresses[] -> {
      _id,
      name,
      address,
      city,
      state,
      zip,
      default,
      createdAt
    },
    preferences,
    wishlist[] -> {
      _id,
      name,
      slug,
      image {
        asset -> {
          _id,
          url
        }
      },
      price,
      currency
    },
    cart[] {
      product -> {
        _id,
        name,
        slug,
        image {
          asset -> {
            _id,
            url
          }
        },
        price,
        currency,
        inStock,
        stockQuantity
      },
      quantity,
      size,
      color,
      addedAt
    },
    orders[] -> {
      _id,
      orderNumber,
      totalPrice,
      currency,
      orderStatus,
      orderDate
    },
    loyaltyPoints,
    rewardPoints,
    totalSpent,
    lastLogin,
    isActive,
    createdAt,
    updatedAt
  }
`;

export const USER_ADDRESSES_QUERY = `
  *[_type == "address" && user._ref == $userId] | order(default desc, createdAt desc) {
    _id,
    name,
    address,
    city,
    state,
    zip,
    default,
    createdAt
  }
`;

export const USER_CART_QUERY = `
  *[_type == "user" && clerkUserId == $clerkUserId][0] {
    cart[] {
      product -> {
        _id,
        name,
        slug,
        image {
          asset -> {
            _id,
            url
          }
        },
        price,
        currency,
        inStock,
        stockQuantity,
        categories[] -> {
          name
        }
      },
      quantity,
      size,
      color,
      addedAt
    }
  }
`;

export const USER_WISHLIST_QUERY = `
  *[_type == "user" && clerkUserId == $clerkUserId][0] {
    wishlist[] -> {
      _id,
      name,
      slug,
      image {
        asset -> {
          _id,
          url
        }
      },
      price,
      currency,
      inStock,
      categories[] -> {
        name
      }
    }
  }
`;

export const USER_ORDERS_QUERY = `
  *[_type == "order" && clerkUserId == $clerkUserId] | order(orderDate desc) {
    _id,
    orderNumber,
    products[] {
      product -> {
        _id,
        name,
        image {
          asset -> {
            _id,
            url
          }
        },
        price,
        currency
      },
      quantity
    },
    totalPrice,
    currency,
    amountDiscount,
    address,
    orderStatus,
    orderDate,
    invoice
  }
`;

export const ORDER_BY_ID_QUERY = `
  *[_type == "order" && _id == $orderId][0] {
    _id,
    orderNumber,
    clerkUserId,
    customerName,
    email,
    products[] {
      product -> {
        _id,
        name,
        slug,
        image {
          asset -> {
            _id,
            url
          }
        },
        price,
        currency,
        categories[] -> {
          title
        }
      },
      quantity
    },
    subtotal,
    tax,
    shipping,
    totalPrice,
    currency,
    amountDiscount,
    address,
    orderStatus,
    paymentStatus,
    paymentMethod,
    orderDate,
    invoice,
    stripeCheckoutSessionId,
    stripePaymentIntentId,
    paymentCompletedAt,
    addressConfirmedBy,
    addressConfirmedAt,
    orderConfirmedBy,
    orderConfirmedAt,
    packedBy,
    packedAt,
    assignedDeliverymanName,
    dispatchedAt,
    cashCollectedAt,
    paymentReceivedAt,
    deliveredBy,
    deliveredAt
  }
`;

export interface SanityUser {
  _id?: string;
  clerkUserId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  rewardPoints?: number;
  walletBalance?: number;
  isActive?: boolean;
  premiumStatus?: string;
  businessStatus?: string;
  isBusiness?: boolean;
  roles?: string[];
  [key: string]: unknown;
}

// User Functions
export const getUserByClerkId = async (
  clerkUserId: string
): Promise<SanityUser | null> => {
  try {
    const { data } = await sanityFetch({
      query: USER_BY_CLERK_ID_QUERY,
      params: { clerkUserId },
    });
    return (data as SanityUser) ?? null;
  } catch (error) {
    console.error("Error fetching user by Clerk ID:", error);
    return null;
  }
};

export const getUserAddresses = async (userId: string) => {
  try {
    const { data } = await sanityFetch({
      query: USER_ADDRESSES_QUERY,
      params: { userId },
    });
    return data ?? [];
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return [];
  }
};

export const getUserCart = async (clerkUserId: string) => {
  try {
    const { data } = await sanityFetch({
      query: USER_CART_QUERY,
      params: { clerkUserId },
    });
    return (data as { cart?: Record<string, unknown>[] })?.cart ?? [];
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return [];
  }
};

export const getUserWishlist = async (clerkUserId: string) => {
  try {
    const { data } = await sanityFetch({
      query: USER_WISHLIST_QUERY,
      params: { clerkUserId },
    });
    return (data as { wishlist?: Record<string, unknown>[] })?.wishlist ?? [];
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    return [];
  }
};

export const getUserOrders = async (
  clerkUserId: string
): Promise<SanityOrder[]> => {
  try {
    const { data } = await sanityFetch({
      query: USER_ORDERS_QUERY,
      params: { clerkUserId },
    });
    return (data as SanityOrder[]) ?? [];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

export interface SanityOrderProductItem {
  product?: {
    _id?: string;
    name?: string;
    slug?: { current?: string };
    image?: { asset?: { url?: string } };
    images?: Array<{ asset?: { _id?: string; url?: string } }>;
    price?: number;
    currency?: string;
  };
  quantity?: number;
  price?: number;
}

export interface SanityOrderAddress {
  name?: string;
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
}

export interface SanityOrder {
  _id: string;
  orderNumber: string;
  clerkUserId?: string;
  customerName?: string;
  email?: string;
  products?: SanityOrderProductItem[];
  items?: SanityOrderProductItem[];
  address?: SanityOrderAddress;
  shippingAddress?: SanityOrderAddress;
  subtotal?: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  totalPrice?: number;
  currency?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  orderDate?: string;
  _createdAt?: string;
  [key: string]: unknown;
}

export const getOrderById = async (orderId: string): Promise<SanityOrder | null> => {
  try {
    const { data } = await sanityFetch({
      query: ORDER_BY_ID_QUERY,
      params: { orderId },
    });
    return (data as SanityOrder) ?? null;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
};

// User Notifications Queries
export const USER_NOTIFICATIONS_QUERY = `
  *[_type == "user" && clerkUserId == $clerkUserId][0] {
    notifications[] {
      id,
      title,
      message,
      type,
      read,
      priority,
      sentAt,
      readAt,
      sentBy,
      actionUrl
    }
  }
`;

export interface SanityNotificationItem {
  id?: string;
  _id?: string;
  title?: string;
  message?: string;
  read?: boolean;
  readAt?: string;
  sentAt?: string;
  _createdAt?: string;
  [key: string]: unknown;
}

export const getUserNotifications = async (
  clerkUserId: string
): Promise<SanityNotificationItem[]> => {
  try {
    const { data } = await sanityFetch({
      query: USER_NOTIFICATIONS_QUERY,
      params: { clerkUserId },
    });
    return (data as { notifications?: SanityNotificationItem[] })?.notifications ?? [];
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
};

export const MARK_NOTIFICATION_READ_QUERY = `
  *[_type == "user" && clerkUserId == $clerkUserId][0] {
    _id,
    notifications
  }
`;

export const markNotificationAsRead = async (
  clerkUserId: string,
  notificationId: string
) => {
  try {
    const user = await sanityFetch({
      query: MARK_NOTIFICATION_READ_QUERY,
      params: { clerkUserId },
    });

    if (!user.data) {
      throw new Error("User not found");
    }

    const userData = user.data as { _id: string; notifications: SanityNotificationItem[] };
    const updatedNotifications = (userData.notifications || []).map(
      (notification: SanityNotificationItem) => {
        if (notification.id === notificationId || notification._id === notificationId) {
          return {
            ...notification,
            read: true,
            readAt: new Date().toISOString(),
          };
        }
        return notification;
      }
    );

    const { writeClient } = await import("../client");

    await writeClient
      .patch(userData._id)
      .set({ notifications: updatedNotifications })
      .commit();

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
};

export const deleteUserNotification = async (
  clerkUserId: string,
  notificationId: string
) => {
  try {
    const user = await sanityFetch({
      query: MARK_NOTIFICATION_READ_QUERY,
      params: { clerkUserId },
    });

    if (!user.data) {
      throw new Error("User not found");
    }

    const userData = user.data as { _id: string; notifications: SanityNotificationItem[] };
    const updatedNotifications = (userData.notifications || []).filter(
      (notification: SanityNotificationItem) =>
        notification.id !== notificationId && notification._id !== notificationId
    );

    const { writeClient } = await import("../client");

    await writeClient
      .patch(userData._id)
      .set({ notifications: updatedNotifications })
      .commit();

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
};
