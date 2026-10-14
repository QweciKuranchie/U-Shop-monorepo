import { defineType, defineField } from "sanity";
import { PackageIcon } from "@sanity/icons";

/**
 * One restock event for a product. Created by the admin Inventory page,
 * which also increments `product.stock` and writes a `stockMovement`.
 */
export const restockType = defineType({
  name: "restock",
  title: "Restock",
  type: "document",
  icon: PackageIcon,
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
      title: "Quantity Added",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({ name: "notes", title: "Notes", type: "text" }),
    defineField({
      name: "actorClerkId",
      title: "Restocked By (Clerk user ID)",
      type: "string",
    }),
    defineField({
      name: "actorName",
      title: "Restocked By (name)",
      type: "string",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "product.name", qty: "quantity", date: "createdAt" },
    prepare({ title, qty, date }) {
      return { title: title ?? "Product", subtitle: `+${qty ?? 0} · ${date ?? ""}` };
    },
  },
});
