import { Resend } from "resend";
import { escapeHtml } from "@/lib/newsletterToken";

// User- and seller-controlled text (names, product titles, addresses, notes) must
// be escaped before it goes into an HTML email we send from our own domain;
// otherwise a product titled `<a href=phish>` becomes a link in a U-Shop receipt.
const esc = (v: unknown): string => escapeHtml(String(v ?? ""));

let resendInstance: Resend | null = null;

function getSenderEmail(): string {
  const sender = process.env.SENDER_EMAIL_ADDRESS || process.env.RESEND_FROM_EMAIL;
  if (!sender) {
    throw new Error("SENDER_EMAIL_ADDRESS or RESEND_FROM_EMAIL env var is required");
  }
  return sender;
}

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY env var is required");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// Type definitions
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  estimatedDelivery?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SendMailParams {
  email: string;
  subject: string;
  text: string;
  html?: string;
}

export function formatCurrency(amount: number, country: string = "Ghana"): string {
  const normalizedCountry = (country || "Ghana").toLowerCase();
  if (normalizedCountry === "ghana" || normalizedCountry === "gh") {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export interface OrderStatusEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  trackingNote?: string;
}

const STATUS_EMAIL_CONFIG: Record<
  string,
  {
    subject: (id: string) => string;
    heading: string;
    body: (id: string, note?: string) => string;
  }
> = {
  processing: {
    subject: (id) => `Your order #${id} is being processed ⚙️`,
    heading: "Your order is being processed",
    body: (id) =>
      `Your order #${id} is being prepared. We'll notify you once it ships.`,
  },
  paid: {
    subject: (id) => `Payment confirmed for order #${id} ✅`,
    heading: "Payment confirmed!",
    body: (id) =>
      `We've received your payment for order #${id}. Your order will be processed shortly.`,
  },
  shipped: {
    subject: (id) => `Your order #${id} has shipped! 🚚`,
    heading: "Your order has shipped!",
    body: (id, note) =>
      `Great news! Order #${id} is on its way.${
        note ? ` Tracking info: ${note}` : " You'll receive tracking details soon."
      }`,
  },
  out_for_delivery: {
    subject: (id) => `Your order #${id} is out for delivery 🛵`,
    heading: "Out for delivery today!",
    body: (id) =>
      `Your order #${id} is with our delivery partner and should arrive today. Please be available to receive it.`,
  },
  delivered: {
    subject: (id) => `Order #${id} delivered ✅`,
    heading: "Your order has been delivered!",
    body: (id) =>
      `Order #${id} has been delivered. We hope you enjoy your purchase! Feel free to leave a review.`,
  },
  cancelled: {
    subject: (id) => `Your order #${id} has been cancelled`,
    heading: "Order cancelled",
    body: (id, note) =>
      `Your order #${id} has been cancelled.${
        note ? ` Reason: ${note}` : ""
      } If you paid online, a refund will be processed to your wallet within 1–3 business days.`,
  },
};

const sendOrderStatusEmail = async (
  params: OrderStatusEmailParams
): Promise<EmailResponse> => {
  const { orderId, customerName, customerEmail, newStatus, trackingNote } = params;
  const config = STATUS_EMAIL_CONFIG[newStatus.toLowerCase()];

  if (!config) {
    console.warn(`sendOrderStatusEmail: no template for status "${newStatus}"`);
    return { success: false, error: `No template for status: ${newStatus}` };
  }

  const subject = config.subject(orderId);
  const heading = config.heading;
  const bodyText = config.body(orderId, trackingNote);
  const senderEmail = getSenderEmail();
  const resend = getResendClient();
  const fromAddress = senderEmail.includes("<")
    ? senderEmail
    : `UShop <${senderEmail}>`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ushopgh.com";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #063c28 0%, #3b9c3c 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .header h1 { font-size: 24px; margin: 0 0 8px; }
    .content { padding: 30px 20px; }
    .status-box { background: #e8f5e8; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { background: #343a40; color: #fff; padding: 20px; text-align: center; font-size: 13px; }
    a { color: #3b9c3c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${heading}</h1>
      <p>UShop Order Update</p>
    </div>
    <div class="content">
      <p>Hi ${esc(customerName)},</p>
      <div class="status-box">
        <p>${esc(bodyText)}</p>
      </div>
      <p>You can track your order at <a href="${baseUrl}/user/orders">My Orders</a>.</p>
      <p>Thank you for shopping with UShop!</p>
    </div>
    <div class="footer">
      <p>UShop &bull; Accra, Ghana &bull; <a href="mailto:support@ushopgh.com" style="color:#aaa">support@ushopgh.com</a></p>
    </div>
  </div>
</body>
</html>`;

  try {
    const { data: resData, error } = await resend.emails.send({
      from: fromAddress,
      to: [customerEmail],
      subject,
      html,
      text: `Hi ${customerName},\n\n${bodyText}\n\nTrack your order: ${baseUrl}/user/orders\n\nThank you for shopping with UShop!`,
    });

    if (error) {
      console.error("Resend error sending order status email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: resData?.id };
  } catch (error) {
    console.error("Failed to send order status email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

const generateOrderConfirmationHTML = (data: OrderConfirmationData): string => {
  const country = data.shippingAddress?.country || "Ghana";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${data.orderId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #063c28 0%, #3b9c3c 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px 20px;
        }
        
        .greeting {
            margin-bottom: 25px;
        }
        
        .greeting h2 {
            color: #063c28;
            font-size: 22px;
            margin-bottom: 10px;
        }
        
        .order-summary {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #dee2e6;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .order-id {
            font-weight: 700;
            color: #063c28;
            font-size: 18px;
        }
        
        .order-date {
            color: #6c757d;
            font-size: 14px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
            background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
            color: #495057;
            font-weight: 700;
            padding: 15px 12px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .items-table td {
            padding: 18px 12px;
            border-bottom: 1px solid #e9ecef;
            background: white;
        }
        
        .items-table tr:hover td {
            background: #f8f9fa;
        }
        
        .item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #dee2e6;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .item-name {
            font-weight: 600;
            color: #495057;
            margin-bottom: 5px;
        }
        
        .quantity {
            background-color: #3b9c3c;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .price {
            font-weight: 700;
            color: #063c28;
        }
        
        .totals {
            margin-top: 25px;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            border: 1px solid #dee2e6;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px 0;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .total-row span:first-child {
            font-weight: 600;
            color: #495057;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .total-row span:last-child {
            font-weight: 700;
            color: #063c28;
            font-size: 18px;
        }
        
        .total-row.final {
            background: linear-gradient(135deg, #063c28 0%, #3b9c3c 100%);
            color: white;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            border: none;
            box-shadow: 0 4px 8px rgba(6, 60, 40, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .total-row.final span:first-child {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .total-row.final span:last-child {
            color: white;
            font-size: 24px;
            font-weight: 800;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .shipping-info {
            background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #c3e6cb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .shipping-info h3 {
            color: #063c28;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .address {
            color: #495057;
            line-height: 1.8;
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .address strong {
            color: #063c28;
            font-size: 16px;
        }
        
        .delivery-info {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #ffeeba;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .delivery-info h3 {
            color: #856404;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .delivery-info p {
            color: #664d03;
            font-weight: 600;
            background: white;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 0;
            border: 1px solid #f5c842;
        }
        
        .next-steps {
            background: linear-gradient(135deg, #d1ecf1 0%, #b8e6ff 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #bee5eb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .next-steps h3 {
            color: #0c5460;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .next-steps ul {
            list-style: none;
            padding-left: 0;
        }
        
        .next-steps li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
            color: #0c5460;
        }
        
        .next-steps li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #17a2b8;
            font-weight: bold;
        }
        
        .support-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        
        .support-section h3 {
            color: #063c28;
            margin-bottom: 15px;
        }
        
        .contact-info {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
        }
        
        .contact-item {
            text-align: center;
        }
        
        .contact-item strong {
            color: #063c28;
            display: block;
            margin-bottom: 5px;
        }
        
        .footer {
            background: linear-gradient(135deg, #343a40 0%, #495057 100%);
            color: #ffffff;
            padding: 40px 20px;
            text-align: center;
            border-top: 4px solid #063c28;
        }
        
        .footer p {
            margin-bottom: 15px;
            opacity: 0.9;
            font-size: 14px;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            color: #ffffff;
            text-decoration: none;
            margin: 0 10px;
            opacity: 0.8;
            transition: opacity 0.3s;
        }
        
        .social-links a:hover {
            opacity: 1;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
            }
            
            .header, .content, .footer {
                padding: 20px 15px;
            }
            
            .items-table {
                font-size: 14px;
            }
            
            .items-table th,
            .items-table td {
                padding: 8px 4px;
            }
            
            .order-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .contact-info {
                flex-direction: column;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Thank you for shopping with UShop</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Greeting -->
            <div class="greeting">
                <h2>Hi ${esc(data.customerName)}!</h2>
                <p>We're excited to let you know that your order has been confirmed and is being prepared for shipment. You'll receive another email when your order is on its way.</p>
            </div>
            
            <!-- Order Summary -->
            <div class="order-summary">
                <div class="order-header">
                    <span class="order-id">Order #${data.orderId}</span>
                    <span class="order-date">Placed on ${data.orderDate}</span>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 60px;">Item</th>
                            <th>Product</th>
                            <th style="width: 80px; text-align: center;">Qty</th>
                            <th style="width: 100px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items
                          .map(
                            (item) => `
                            <tr>
                                <td>
                                    ${
                                      item.image
                                        ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" class="item-image" />`
                                        : `<div class="item-image" style="background-color: #e9ecef; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6c757d;">No Image</div>`
                                    }
                                </td>
                                <td>
                                    <div class="item-name">${esc(item.name)}</div>
                                </td>
                                <td style="text-align: center;">
                                    <span class="quantity">${
                                      item.quantity
                                    }</span>
                                </td>
                                <td style="text-align: right;">
                                    <span class="price">${formatCurrency(
                                      item.price * item.quantity
                                    )}</span>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(data.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>${formatCurrency(data.shipping)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>${formatCurrency(data.tax)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total:</span>
                        <span>${formatCurrency(data.total)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Shipping Information -->
            <div class="shipping-info">
                <h3>📦 Shipping Address</h3>
                <div class="address">
                    <strong>${esc(data.shippingAddress.name)}</strong><br>
                    ${esc(data.shippingAddress.street)}<br>
                    ${esc(data.shippingAddress.city)}, ${esc(
    data.shippingAddress.state
  )} ${esc(data.shippingAddress.zipCode)}<br>
                    ${esc(data.shippingAddress.country)}
                </div>
            </div>
            
            ${
              data.estimatedDelivery
                ? `
            <!-- Delivery Information -->
            <div class="delivery-info">
                <h3>🚚 Estimated Delivery</h3>
                <p>${data.estimatedDelivery}</p>
            </div>
            `
                : ""
            }
            
            <!-- Next Steps -->
            <div class="next-steps">
                <h3>What happens next?</h3>
                <ul>
                    <li>We'll prepare your order for shipment</li>
                    <li>You'll receive a tracking number via email once shipped</li>
                    <li>Track your package progress in real-time</li>
                    <li>Your order will be delivered to the address provided</li>
                </ul>
            </div>
            
            <!-- Support Section -->
            <div class="support-section">
                <h3>Need Help?</h3>
                <p>Our customer service team is here to help with any questions about your order.</p>
                
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>Email</strong>
                        <span>support@ushopgh.com</span>
                    </div>
                    <div class="contact-item">
                        <strong>Phone</strong>
                        <span>+1 (555) 123-4567</span>
                    </div>
                    <div class="contact-item">
                        <strong>Hours</strong>
                        <span>Mon-Fri: 9AM-6PM</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>UShop</strong></p>
            <p>123 Shopping Street, Commerce District<br>
               Accra, Ghana</p>
            <p>Thank you for choosing UShop!</p>
            
            <div class="social-links">
                <a href="https://ushopgh.com">Website</a> |
                <a href="https://ushopgh.com/contact">Support</a> |
                <a href="https://ushopgh.com/terms">Terms</a>
            </div>
        </div>
    </div>
</body>
</html>`;
};

const sendOrderConfirmationEmail = async (
  data: OrderConfirmationData
): Promise<EmailResponse> => {
  try {
    const htmlContent = generateOrderConfirmationHTML(data);
    const senderEmail = getSenderEmail();
    const resend = getResendClient();

    const fromAddress = senderEmail.includes("<")
      ? senderEmail
      : `UShop Ecommerce <${senderEmail}>`;

    const { data: resData, error } = await resend.emails.send({
      from: fromAddress,
      to: [data.customerEmail],
      subject: `Order Confirmation - ${data.orderId} | Thank you for your purchase!`,
      html: htmlContent,
      text: `
Hi ${data.customerName}!

Thank you for your order! Here are the details:

Order ID: ${data.orderId}
Order Date: ${data.orderDate}
Total: $${data.total.toFixed(2)}

Items Ordered:
${data.items
  .map(
    (item) =>
      `- ${item.name} (Qty: ${item.quantity}) - $${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

Shipping Address:
${data.shippingAddress.name}
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${
        data.shippingAddress.zipCode
      }
${data.shippingAddress.country}

${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ""}

We'll send you another email with tracking information once your order ships.

If you have any questions, please contact us at support@ushopgh.com.

Thank you for choosing UShop!
      `,
    });

    if (error) {
      console.error("Resend error sending order confirmation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: resData?.id };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Simple email function for other purposes
const sendMail = async ({
  email,
  subject,
  text,
  html,
}: SendMailParams): Promise<EmailResponse> => {
  try {
    const senderEmail = getSenderEmail();
    const resend = getResendClient();

    const fromAddress = senderEmail.includes("<")
      ? senderEmail
      : `UShop Ecommerce <${senderEmail}>`;

    const { data: resData, error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject,
      text,
      ...(html && { html }),
    });

    if (error) {
      console.error("Resend error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: resData?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export { sendOrderConfirmationEmail, sendOrderStatusEmail, sendMail };
export type {
  OrderConfirmationData,
  OrderItem,
  ShippingAddress,
  EmailResponse,
  SendMailParams,
};
