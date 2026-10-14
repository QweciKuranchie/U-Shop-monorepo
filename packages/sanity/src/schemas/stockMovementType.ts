import { defineType, defineField } from "sanity";
import { TransferIcon } from "@sanity/icons";

/**
 * Immutable ledger of every stock change made through the admin app.
 * `quantity` is signed: positive = stock in, negative = stock out.
 */
export const stockMovementType = defineType({
  name: "stockMovement",
  title: "Stock Movement",
  type: "document",
  icon: TransferIcon,
  readOnly: true,
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "quantity",
      title: "Quantity (signed)",
      type: "number",
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: "reason",
      title: "Reason",
      type: "string",
      options: {
        list: [
          { title: "Restock", value: "restock" },
          { title: "Adjustment", value: "adjustment" },
          { title: "Sale", value: "sale" },
          { title: "Return", value: "return" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "stockAfter", title: "Stock After", type: "number" }),
    defineField({ name: "actorClerkId", title: "Actor (Clerk user ID)", type: "string" }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "product.name", qty: "quantity", reason: "reason" },
    prepare({ title, qty, reason }) {
      return { title: title ?? "Product", subtitle: `${qty > 0 ? "+" : ""}${qty ?? 0} · ${reason ?? ""}` };
    },
  },
});
