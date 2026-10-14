import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";
import {
  BANNER_ICONS,
  HOMEPAGE_PLACEMENTS,
  MINI_STYLES,
  PROMO_STYLES,
  isSafeHref,
} from "../homepageBanners";

/**
 * A banner/card on the storefront homepage. Normally managed from the admin
 * panel (/admin/homepage); editable here too.
 */
export const homepageBannerType = defineType({
  name: "homepageBanner",
  title: "Homepage Banner",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "placement",
      title: "Placement",
      type: "string",
      options: {
        list: HOMEPAGE_PLACEMENTS.map(({ title, value }) => ({ title, value })),
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "badge",
      title: "Badge / offer text",
      type: "string",
      description: 'Small label, e.g. "Limited Time Offer 30% Off".',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      description: "Used by Action cards.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "price",
      title: "Price text",
      type: "string",
      description: 'Shown as typed, e.g. "GH₵ 6,500.00". Used by promo placements.',
    }),
    defineField({
      name: "buttonText",
      title: "Button text",
      type: "string",
      description: "Hero button label / Action card call to action.",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "string",
      description: 'Internal path ("/deals"), full https:// URL, or "tel:+233...".',
      validation: (Rule) =>
        Rule.required().custom((v) =>
          isSafeHref(v) ? true : 'Use a path starting with "/", an http(s):// URL, tel: or mailto:'
        ),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL (fallback)",
      type: "string",
      description: "Used only when no image is uploaded, e.g. /assets/images/hero/x.png.",
    }),
    defineField({
      name: "style",
      title: "Colour style",
      type: "string",
      options: {
        list: [...MINI_STYLES, ...PROMO_STYLES].map(({ title, value }) => ({ title, value })),
      },
      description: "Action cards use Purple/Green/Red/Dark; promo placements use the other presets.",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Action cards only.",
      options: { list: BANNER_ICONS.map(({ title, value }) => ({ title, value })) },
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers show first within a placement.",
      initialValue: 100,
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "startsAt",
      title: "Show from",
      type: "datetime",
      description: "Optional. Hidden before this time.",
    }),
    defineField({
      name: "endsAt",
      title: "Show until",
      type: "datetime",
      description: "Optional. Hidden after this time.",
      validation: (Rule) =>
        Rule.custom((endsAt, ctx) => {
          const startsAt = (ctx.document as { startsAt?: string } | undefined)?.startsAt;
          if (endsAt && startsAt && new Date(endsAt) <= new Date(startsAt)) {
            return '"Show until" must be after "Show from".';
          }
          return true;
        }),
    }),
  ],
  orderings: [
    {
      title: "Placement, then order",
      name: "placementOrder",
      by: [
        { field: "placement", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", placement: "placement", active: "isActive", media: "image" },
    prepare({ title, placement, active, media }) {
      return {
        title,
        subtitle: `${placement ?? "?"}${active === false ? " · hidden" : ""}`,
        media,
      };
    },
  },
});
