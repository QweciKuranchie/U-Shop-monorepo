"use client";
import React, { useState } from "react";
import { TableBody, TableCell, TableRow, Button } from "@repo/ui";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import Link from "next/link";
import PriceFormatter from "./PriceFormatter";
import { MY_ORDERS_QUERYResult } from "@repo/sanity";
import { format } from "date-fns";
import { CreditCard, Eye, Download } from "lucide-react";
import { toast } from "sonner";

const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERYResult }) => {
  const [payingOrderId] = useState<string | null>(null);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState<string | null>(
    null
  );

  const handlePayNow = async (orderId: string) => {
    if (!orderId) return;

    // Redirect to checkout page with order ID
    window.location.href = `/checkout?orderId=${orderId}`;
  };

  const handleViewInvoice = (url?: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleDownloadInvoice = async (url?: string, invoiceNumber?: string) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Invoice-${invoiceNumber || "order"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    if (!orderId) return;

    setGeneratingInvoiceId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Invoice generated successfully!");
        // Refresh the page to show updated invoice data
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to generate invoice");
      }
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setGeneratingInvoiceId(null);
    }
  };

  const isOrderPayable = (order: MY_ORDERS_QUERYResult[number]) => {
    // Order is payable if payment is not completed and order is not cancelled
    const isPaid = order.paymentStatus === PAYMENT_STATUSES.PAID;
    const isCancelled = order.orderStatus === ORDER_STATUSES.CANCELLED;
    return !isPaid && !isCancelled;
  };

  return (
    <>
      <TableBody>
        {orders.map((order: any) => (
          <TableRow key={order?.orderNumber} className="hover:bg-gray-50 h-16">
            <TableCell className="font-medium text-sm">
              <div className="flex flex-col">
                <span className="truncate max-w-20 sm:max-w-none">
                  {order.orderNumber?.slice(-10) ?? "N/A"}...
                </span>
                <span className="text-xs text-gray-500 md:hidden">
                  {order?.orderDate &&
                    format(new Date(order.orderDate), "dd/MM")}
                </span>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-sm">
              {order?.orderDate &&
                format(new Date(order.orderDate), "dd/MM/yyyy")}
            </TableCell>
            <TableCell className="text-sm">
              <span className="hidden sm:inline">{order?.customerName}</span>
              <span className="sm:hidden">
                {order?.customerName?.split(" ")[0]}
              </span>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-sm truncate max-w-32">
              {order?.email}
            </TableCell>
            <TableCell className="text-sm">
              <PriceFormatter
                amount={order?.totalPrice}
                className="text-gray-900 font-medium text-xs sm:text-sm"
              />
            </TableCell>
            <TableCell>
              {order?.orderStatus && (
                <span
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    order.orderStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.orderStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.orderStatus}
                </span>
              )}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {order?.invoice?.hosted_invoice_url ? (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() =>
                      handleViewInvoice(order.invoice.hosted_invoice_url)
                    }
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() =>
                      handleDownloadInvoice(
                        order.invoice.hosted_invoice_url,
                        order.invoice.number || order.orderNumber
                      )
                    }
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ) : order?.paymentStatus === "paid" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs"
                  disabled={generatingInvoiceId === order._id}
                  onClick={() => handleGenerateInvoice(order._id)}
                >
                  {generatingInvoiceId === order._id ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                      Gen...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              ) : (
                <span className="text-xs text-gray-500">----</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                >
                  <Link href={`/user/orders/${order._id}`}>
                    <Eye className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Link>
                </Button>
                {isOrderPayable(order) && (
                  <Button
                    onClick={() => handlePayNow(order._id)}
                    disabled={payingOrderId === order._id}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-2 text-xs"
                  >
                    {payingOrderId === order._id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white sm:mr-1"></div>
                        <span className="hidden sm:inline">
                          Paying...
                        </span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Pay Now</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default OrdersComponent;
