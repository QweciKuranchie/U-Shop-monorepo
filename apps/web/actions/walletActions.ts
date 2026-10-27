"use server";

import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@repo/sanity";
import { v4 as uuidv4 } from "uuid";
import { debitWallet } from "@/lib/wallet/walletService";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";

const MIN_WITHDRAWAL = 10;

// Types
interface WalletTransaction {
  id: string;
  type: "credit_refund" | "credit_manual" | "debit_order" | "debit_withdrawal";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  withdrawalRequestId?: string;
  processedBy?: string;
  createdAt: string;
  status: "completed" | "pending" | "failed" | "cancelled";
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  method: "bank" | "paypal" | "stripe" | "check";
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  paypalEmail?: string;
  status:
    | "pending"
    | "approved"
    | "processing"
    | "completed"
    | "rejected"
    | "cancelled";
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
  notes?: string;
  transactionId?: string;
}

/**
 * Get user's wallet balance
 */
export async function getUserWalletBalance(): Promise<{
  success: boolean;
  balance?: number;
  message?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{ walletBalance }`,
      { clerkUserId: userId }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      balance: user.walletBalance || 0,
    };
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return { success: false, message: "Failed to fetch wallet balance" };
  }
}

/**
 * Get user's wallet transaction history
 */
export async function getWalletTransactions(): Promise<{
  success: boolean;
  transactions?: WalletTransaction[];
  message?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{ walletTransactions }`,
      { clerkUserId: userId }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      transactions: user.walletTransactions || [],
    };
  } catch (error) {
    console.error("Error getting wallet transactions:", error);
    return { success: false, message: "Failed to fetch transactions" };
  }
}

/**
 * Deduct amount from wallet (used during checkout)
 */
export async function deductWalletBalance(
  amount: number,
  orderId: string
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }
  // Validation + optimistic locking live in the service (a negative amount used to
  // CREDIT the wallet here).
  return debitWallet(userId, amount, orderId);
}

/**
 * Request withdrawal from wallet
 */
export async function requestWithdrawal(data: {
  amount: number;
  method: "bank" | "paypal" | "stripe" | "check";
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  paypalEmail?: string;
}): Promise<{ success: boolean; message: string; requestId?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    // Rate limit per user: this is a public Server Action.
    const limited = await checkRateLimitByKey(userId, "wallet:withdraw", { limit: 5, windowMs: 10 * 60_000 });
    if (limited) return { success: false, message: "Too many requests. Please try again later." };

    // `data` comes from the browser. A non-number (or NaN) used to sail through
    // the `<= 0` / `< MIN` checks because every comparison with NaN is false.
    const amount = Math.round(Number(data?.amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, message: "Invalid amount" };
    }
    if (amount < MIN_WITHDRAWAL) {
      return { success: false, message: `Minimum withdrawal amount is GH₵${MIN_WITHDRAWAL}` };
    }
    if (!["bank", "paypal", "stripe", "check"].includes(data.method)) {
      return { success: false, message: "Invalid withdrawal method" };
    }
    const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);
    const bankDetails = data.bankDetails
      ? {
          accountHolderName: clip(data.bankDetails.accountHolderName, 100) ?? "",
          bankName: clip(data.bankDetails.bankName, 100) ?? "",
          accountNumber: clip(data.bankDetails.accountNumber, 40) ?? "",
          routingNumber: clip(data.bankDetails.routingNumber, 40),
          swiftCode: clip(data.bankDetails.swiftCode, 20),
        }
      : undefined;
    const paypalEmail = clip(data.paypalEmail, 254);

    const user = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $userId][0]{ 
        _id, 
        _rev,
        walletBalance, 
        withdrawalRequests 
      }`,
      { userId }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const currentBalance = user.walletBalance || 0;

    // Requests do not move money until an admin pays them out, so the balance
    // alone does not stop a user filing the same GH₵ many times. Everything still
    // open counts against what is available.
    const openTotal = ((user.withdrawalRequests ?? []) as WithdrawalRequest[])
      .filter((r) => ["pending", "approved", "processing"].includes(r.status))
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const available = Math.round((currentBalance - openTotal) * 100) / 100;

    if (available < amount) {
      return {
        success: false,
        message: `Insufficient balance. Available: GH₵${Math.max(0, available).toFixed(2)}`,
      };
    }

    // Create withdrawal request
    const withdrawalRequest: WithdrawalRequest = {
      id: uuidv4(),
      amount,
      method: data.method,
      bankDetails,
      paypalEmail,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    // Add withdrawal request
    await backendClient
      .patch(user._id)
      .ifRevisionId(user._rev)
      .set({
        withdrawalRequests: [
          withdrawalRequest,
          ...(user.withdrawalRequests || []),
        ],
      })
      .commit();

    return {
      success: true,
      message:
        "Withdrawal request submitted successfully. It will be processed within 3-5 business days.",
      requestId: withdrawalRequest.id,
    };
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    return {
      success: false,
      message: "Failed to submit withdrawal request",
    };
  }
}

/**
 * Get user's withdrawal requests
 */
export async function getWithdrawalRequests(): Promise<{
  success: boolean;
  requests?: WithdrawalRequest[];
  message?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $userId][0]{ withdrawalRequests }`,
      { userId }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      requests: user.withdrawalRequests || [],
    };
  } catch (error) {
    console.error("Error getting withdrawal requests:", error);
    return { success: false, message: "Failed to fetch withdrawal requests" };
  }
}

/**
 * Cancel withdrawal request (only if pending)
 */
export async function cancelWithdrawalRequest(requestId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $userId][0]{ 
        _id, 
        withdrawalRequests 
      }`,
      { userId }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const requests = user.withdrawalRequests || [];
    const request = requests.find((r: WithdrawalRequest) => r.id === requestId);

    if (!request) {
      return { success: false, message: "Withdrawal request not found" };
    }

    if (request.status !== "pending") {
      return {
        success: false,
        message: `Cannot cancel request with status: ${request.status}`,
      };
    }

    // Update request status to cancelled
    const updatedRequests = requests.map((r: WithdrawalRequest) =>
      r.id === requestId ? { ...r, status: "cancelled" as const } : r
    );

    await backendClient
      .patch(user._id)
      .set({ withdrawalRequests: updatedRequests })
      .commit();

    return {
      success: true,
      message: "Withdrawal request cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling withdrawal request:", error);
    return {
      success: false,
      message: "Failed to cancel withdrawal request",
    };
  }
}
