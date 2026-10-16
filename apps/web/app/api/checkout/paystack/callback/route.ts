import { verifyChargeAgainstOrder, toPesewas } from "@/lib/payments/chargeVerification";
import { writeClient } from "@repo/sanity";
import {
  fetchOrderForPayment,
  markOrderPaid,
  runPaidSideEffects,
} from "@/lib/payments/markOrderPaid";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const fail = (reason: string) =>
    NextResponse.redirect(
      new URL(
        `/checkout/payment-failed?${reference ? `reference=${encodeURIComponent(reference)}&` : ""}reason=${encodeURIComponent(reason)}`,
        baseUrl
      )
    );

  if (!reference) return fail("missing_reference");

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const isMock = searchParams.get("mock") === "true" || (!secretKey && reference.startsWith("PSK-"));

  if (isMock) {
    const orderIdParam = searchParams.get("orderId");
    let targetOrderId = orderIdParam;
    let targetOrderNumber = "";

    if (!targetOrderId) {
      const parts = reference.split("-");
      const orderNumber = parts.length >= 2 ? parts[1] : null;
      if (orderNumber) {
        const found = await writeClient.fetch<{ _id: string; orderNumber: string } | null>(
          `*[_type == "order" && orderNumber == $orderNumber][0]{ _id, orderNumber }`,
          { orderNumber }
        );
        targetOrderId = found?._id ?? null;
        targetOrderNumber = found?.orderNumber ?? orderNumber;
      }
    }

    if (targetOrderId) {
      const order = await fetchOrderForPayment(targetOrderId);
      if (order) {
        const { transitioned } = await markOrderPaid(targetOrderId, {
          reference,
          transactionId: "mock_tx_" + Date.now(),
          amountPesewas: toPesewas(order.totalPrice ?? 0),
        }).catch((err) => {
          console.error("Mock markOrderPaid error:", err);
          return { transitioned: false };
        });

        if (transitioned) after(() => runPaidSideEffects(order));

        const successParams = new URLSearchParams({
          order_id: targetOrderId,
          orderNumber: order.orderNumber || targetOrderNumber,
          payment_method: "card",
        });
        return NextResponse.redirect(new URL(`/success?${successParams.toString()}`, baseUrl));
      }
    }
  }

  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not set in callback");
    return fail("internal_error");
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      }
    );
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status || verifyData.data?.status !== "success") {
      const reason = verifyData?.data?.status || verifyData?.message || "verification_failed";
      console.warn("Paystack callback verification failed:", { reference, reason });
      return fail(reason);
    }

    const { orderId, orderNumber, channel } = verifyData.data.metadata || {};

    if (orderId) {
      const order = await fetchOrderForPayment(orderId);

      if (order) {
        // Same integrity gate as the webhook: right order, right amount, right currency.
        const check = verifyChargeAgainstOrder(order, verifyData.data);
        if (!check.ok) {
          console.error("Paystack callback charge rejected", { orderId, reference, reason: check.reason });
          return fail(check.reason);
        }

        // Shared, atomic transition. Whichever of {callback, webhook} wins runs the
        // side effects exactly once, so the confirmation email/notification can no
        // longer be skipped just because the browser redirect arrived first.
        const { transitioned } = await markOrderPaid(orderId, {
          reference,
          transactionId: verifyData.data.id,
          amountPesewas: check.amountPesewas,
        }).catch((error) => {
          // Best-effort here: the webhook is the authoritative retrying path.
          console.error("Callback markOrderPaid failed (webhook will reconcile):", error);
          return { transitioned: false };
        });

        if (transitioned) after(() => runPaidSideEffects(order));
      }
    }

    const successParams = new URLSearchParams({
      order_id: orderId || "",
      orderNumber: orderNumber || "",
      payment_method: channel || "card",
    });
    return NextResponse.redirect(new URL(`/success?${successParams.toString()}`, baseUrl));
  } catch (error) {
    console.error("Error in Paystack callback:", error);
    return fail("verification_failed");
  }
}
