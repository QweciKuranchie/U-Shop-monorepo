"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import {
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Truck,
  DollarSign,
  ClipboardCheck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@repo/utils";

interface TimelineEvent {
  title: string;
  description?: string;
  date?: string;
  status: "completed" | "pending" | "current";
  icon: React.ReactNode;
  employee?: string;
}

interface OrderTimelineProps {
  order: {
    orderDate: string;
    addressConfirmedAt?: string;
    addressConfirmedBy?: string;
    orderConfirmedAt?: string;
    orderConfirmedBy?: string;
    packedAt?: string;
    packedBy?: string;
    paymentCompletedAt?: string;
    paymentStatus: string;
    cashCollectedAt?: string;
    deliveredAt?: string;
    deliveredBy?: string;
    assignedDeliverymanName?: string;
    dispatchedAt?: string;
    orderStatus: string;
    cancelledAt?: string;
    cancelledBy?: string;
  };
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  const getTimelineEvents = useCallback((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Check if order is cancelled
    const isCancelled = order.orderStatus === "cancelled";

    // Determine current status for proper "current" highlighting
    const isAddressConfirmed = !!order.addressConfirmedAt;
    const isOrderConfirmed = !!order.orderConfirmedAt;
    const isPacked = !!order.packedAt;
    const isDispatched = !!(
      order.dispatchedAt || order.assignedDeliverymanName
    );
    const isCashCollected = !!order.cashCollectedAt;
    const isDelivered = !!order.deliveredAt;
    const isCOD = order.paymentStatus === "pending";

    // 1. Order Placed - Always completed
    events.push({
      title: "Order Placed",
      description: "Your order has been received",
      date: order.orderDate,
      status: "completed",
      icon: <ClipboardCheck className="w-5 h-5" />,
    });

    // If order is cancelled, show cancellation and stop
    if (isCancelled) {
      events.push({
        title: "Order Cancelled",
        description: "This order has been cancelled",
        date: order.cancelledAt,
        status: "completed",
        icon: <XCircle className="w-5 h-5" />,
      });
      return events; // Return early to stop showing further timeline steps
    }

    // 2. Address Confirmation - Always show
    if (isAddressConfirmed) {
      events.push({
        title: "Address Confirmed",
        description: order.addressConfirmedBy
          ? `Confirmed by ${order.addressConfirmedBy}`
          : "Delivery address verified",
        date: order.addressConfirmedAt,
        status: "completed",
        icon: <MapPin className="w-5 h-5" />,
        employee: order.addressConfirmedBy,
      });
    } else {
      events.push({
        title: "Address Confirmation",
        description: "Waiting for address verification",
        status: "current",
        icon: <MapPin className="w-5 h-5" />,
      });
    }

    // 3. Order Confirmation - Always show
    if (isOrderConfirmed) {
      events.push({
        title: "Order Confirmed",
        description: order.orderConfirmedBy
          ? `Confirmed by ${order.orderConfirmedBy}`
          : "Order has been confirmed",
        date: order.orderConfirmedAt,
        status: "completed",
        icon: <CheckCircle className="w-5 h-5" />,
        employee: order.orderConfirmedBy,
      });
    } else {
      events.push({
        title: "Order Confirmation",
        description: "Pending order confirmation",
        status: isAddressConfirmed ? "current" : "pending",
        icon: <CheckCircle className="w-5 h-5" />,
      });
    }

    // 4. Packing - Always show
    if (isPacked) {
      events.push({
        title: "Order Packed",
        description: order.packedBy
          ? `Packed by ${order.packedBy}`
          : "Your order has been packed",
        date: order.packedAt,
        status: "completed",
        icon: <PackageCheck className="w-5 h-5" />,
        employee: order.packedBy,
      });
    } else {
      events.push({
        title: "Order Packing",
        description: "Your order will be packed soon",
        status: isOrderConfirmed ? "current" : "pending",
        icon: <PackageCheck className="w-5 h-5" />,
      });
    }

    // 5. Out for Delivery - Always show
    if (isDispatched) {
      events.push({
        title: "Out for Delivery",
        description: order.assignedDeliverymanName
          ? `Assigned to ${order.assignedDeliverymanName}`
          : "Order is out for delivery",
        date: order.dispatchedAt,
        status: "completed",
        icon: <Truck className="w-5 h-5" />,
        employee: order.assignedDeliverymanName,
      });
    } else {
      events.push({
        title: "Out for Delivery",
        description: "Your order will be dispatched for delivery",
        status: isPacked ? "current" : "pending",
        icon: <Truck className="w-5 h-5" />,
      });
    }

    // 6. Payment Collection (for COD only) - Show when applicable
    if (isCOD) {
      if (isCashCollected) {
        events.push({
          title: "Payment Collected",
          description: "Cash on delivery payment received",
          date: order.cashCollectedAt,
          status: "completed",
          icon: <DollarSign className="w-5 h-5" />,
        });
      } else {
        events.push({
          title: "Payment Collection",
          description: "Cash payment will be collected on delivery",
          status: isDispatched ? "current" : "pending",
          icon: <DollarSign className="w-5 h-5" />,
        });
      }
    } else if (order.paymentCompletedAt && !isCashCollected) {
      // Online payment already completed
      events.push({
        title: "Payment Received",
        description: "Payment completed online",
        date: order.paymentCompletedAt,
        status: "completed",
        icon: <DollarSign className="w-5 h-5" />,
      });
    }

    // 7. Delivered - Always show as final step
    if (isDelivered) {
      events.push({
        title: "Delivered",
        description: order.deliveredBy
          ? `Delivered by ${order.deliveredBy}`
          : "Order has been delivered successfully",
        date: order.deliveredAt,
        status: "completed",
        icon: <Package className="w-5 h-5" />,
        employee: order.deliveredBy,
      });
    } else {
      events.push({
        title: "Delivered",
        description: "Your order will be delivered to your address",
        status: (isCOD ? isCashCollected : isDispatched)
          ? "current"
          : "pending",
        icon: <Package className="w-5 h-5" />,
      });
    }

    return events;
  }, [order]);

  useEffect(() => {
    // Animate timeline items on mount
    const timer = setInterval(() => {
      setVisibleItems((prev) => {
        const evts = getTimelineEvents();
        if (prev < evts.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [getTimelineEvents]);

  const events = getTimelineEvents();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-ushop_light_pink">
        <CardTitle className="flex items-center gap-2 text-ushop-purple">
          <Clock className="w-5 h-5" />
          Order Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {events.map((event, index) => (
            <div
              key={index}
              className={cn(
                "relative pb-8 last:pb-0 transition-all duration-500 ease-in-out",
                index < visibleItems
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-6"
              )}
              style={{
                transitionDelay: `${index * 80}ms`,
              }}
            >
              {/* Vertical Line with animated growth */}
              {index !== events.length - 1 && (
                <div className="absolute left-[18px] top-9 w-0.5 h-full bg-gray-200">
                  <div
                    className={cn(
                      "w-full transition-all duration-700 ease-out origin-top",
                      event.status === "completed"
                        ? "bg-ushop-purple h-full"
                        : "bg-transparent h-0"
                    )}
                    style={{
                      transitionDelay: `${index * 150 + 200}ms`,
                    }}
                  />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon with pulse animation for current and pending */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all duration-500 transform",
                    event.status === "completed" &&
                      event.title === "Order Cancelled" &&
                      "bg-red-500 text-white shadow-lg scale-100",
                    event.status === "completed" &&
                      event.title !== "Order Cancelled" &&
                      "bg-ushop-purple text-white shadow-lg scale-100",
                    event.status === "current" &&
                      "bg-ushop-red text-white ring-4 ring-ushop-red/20 animate-pulse-slow scale-110",
                    event.status === "pending" &&
                      "bg-gray-100 text-gray-500 scale-95",
                    index < visibleItems && "scale-100"
                  )}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  {event.icon}

                  {/* Ripple effect for current status */}
                  {event.status === "current" && (
                    <span className="absolute inset-0 rounded-full bg-ushop-red animate-ping opacity-20" />
                  )}

                  {/* Checkmark overlay for completed */}
                  {event.status === "completed" && (
                    <span className="absolute inset-0 rounded-full bg-ushop-purple/10 animate-scale-in" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h4
                        className={cn(
                          "font-semibold text-sm sm:text-base transition-colors duration-300",
                          event.status === "completed" &&
                            event.title === "Order Cancelled" &&
                            "text-red-600",
                          event.status === "completed" &&
                            event.title !== "Order Cancelled" &&
                            "text-ushop-purple",
                          event.status === "current" && "text-ushop-red",
                          event.status === "pending" && "text-gray-500"
                        )}
                      >
                        {event.title}
                      </h4>
                      {event.description && (
                        <p
                          className={cn(
                            "text-xs sm:text-sm mt-1 transition-colors duration-300",
                            event.status === "completed" && "text-gray-700",
                            event.status === "current" &&
                              "text-gray-800 font-medium",
                            event.status === "pending" && "text-gray-500"
                          )}
                        >
                          {event.description}
                        </p>
                      )}
                    </div>
                    {event.date && (
                      <div className="shrink-0 animate-fade-in">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs border transition-all duration-300",
                            event.status === "completed" &&
                              event.title === "Order Cancelled" &&
                              "border-red-300 bg-red-50 text-red-600",
                            event.status === "completed" &&
                              event.title !== "Order Cancelled" &&
                              "border-ushop-purple/30 bg-ushop-purple/5 text-ushop-purple",
                            event.status === "current" &&
                              "border-ushop-red/30 bg-ushop-red/5 text-ushop-red",
                            event.status === "pending" &&
                              "border-gray-200 bg-gray-50 text-gray-500"
                          )}
                        >
                          {format(new Date(event.date), "MMM dd, HH:mm")}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Current status indicator with animation */}
                  {event.status === "current" && (
                    <div className="mt-3 animate-slide-in-bottom">
                      <div className="flex items-center gap-2 px-3 py-2 bg-ushop-red/10 rounded-lg border border-ushop-red/20">
                        <div className="relative flex items-center justify-center">
                          <div className="w-2 h-2 bg-ushop-red rounded-full animate-pulse" />
                          <div className="absolute w-2 h-2 bg-ushop-red rounded-full animate-ping" />
                        </div>
                        <span className="text-xs text-ushop-red font-semibold tracking-wide">
                          IN PROGRESS
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Completed checkmark animation */}
                  {event.status === "completed" &&
                    index === visibleItems - 1 && (
                      <div className="mt-2 flex items-center gap-2 text-ushop-purple text-xs font-medium animate-fade-in">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">Progress</span>
            <span className="font-semibold text-ushop-purple">
              {events.filter((e) => e.status === "completed").length} of{" "}
              {events.length} completed
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-ushop-purple-dark transition-all duration-1000 ease-out rounded-full"
              style={{
                width: `${
                  (events.filter((e) => e.status === "completed").length /
                    events.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
