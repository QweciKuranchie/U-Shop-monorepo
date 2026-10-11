import { defineType, defineField, type ValidationContext } from "sanity";
import { TrolleyIcon } from "@sanity/icons";

interface AttributeValueItem {
  attribute?: { _ref?: string };
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueSelect?: string;
  valueMultiSelect?: string[];
}

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: TrolleyIcon,
  groups: [
    { name: "main", title: "1. Product Information", default: true },
    { name: "specs", title: "2. Additional Information (Specs)" },
    { name: "inventory_warranty", title: "3. Pricing, Inventory & Warranty" },
    { name: "images", title: "4. Images" },
    { name: "reviews", title: "5. Reviews & Ratings" },
  ],
  fields: [
    // ─── TAB 1: PRODUCT INFORMATION ──────────────────────────────
    defineField({
      name: "name",
      title: "Product Title",
      type: "string",
      group: "main",
      description:
        "Include brand, model, key spec, and condition, e.g. 'HP ProBook 450 G8 15.6\" i5 8GB 256GB SSD – Used' (15–70 chars)",
      validation: (Rule) =>
        Rule.required()
          .min(15)
          .max(70)
          .error("Product Title must be between 15 and 70 characters long."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "main",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      group: "main",
      to: [{ type: "brand" }],
      description: "Select brand (filtered by selected category)",
      options: {
        filter: async ({ document, getClient }) => {
          const categoryRef = (
            document?.category as { _ref?: string } | undefined
          )?._ref;

          if (!categoryRef) {
            return { filter: '_type == "brand"' };
          }

          const client = getClient({ apiVersion: "2026-07-07" });
          const categoryDoc = await client.fetch(
            `*[_id == $id || _id == "drafts." + $id][0]{ "brandRefs": allowedBrands[]._ref }`,
            { id: categoryRef.replace(/^drafts\./, "") }
          );

          if (categoryDoc?.brandRefs && categoryDoc.brandRefs.length > 0) {
            return {
              filter: "_id in $brandRefs",
              params: { brandRefs: categoryDoc.brandRefs },
            };
          }

          return { filter: '_type == "brand"' };
        },
      },
    }),
    defineField({
      name: "productClassification",
      title: "Product Classification",
      type: "reference",
      group: "main",
      to: [{ type: "productClassification" }],
      description: "Root classification (e.g. Electronics, Computing, Others)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "main",
      to: [{ type: "category" }],
      description: "Select the leaf category for this product.",
      options: {
        filter: ({ document }) => {
          const classificationRef = (
            document?.productClassification as { _ref?: string } | undefined
          )?._ref;

          if (!classificationRef) {
            return {
              filter: "!defined(_id)",
            };
          }

          return {
            filter:
              'productType._ref == $classificationRef && (level == "leaf" || !defined(level))',
            params: {
              classificationRef,
            },
          };
        },
      },
      validation: (Rule) =>
        Rule.required()
          .error("A category is required.")
          .custom(async (categoryRef, context) => {
            if (!categoryRef?._ref) return true;

            const { document, getClient } = context;
            const productClassificationRef = (
              document?.productClassification as { _ref?: string } | undefined
            )?._ref;

            if (!productClassificationRef) {
              return "Please select a Product Classification first.";
            }

            const client = getClient({ apiVersion: "2026-07-07" });

            const categoryDoc = await client.fetch(
              `*[_id == $id || _id == "drafts." + $id][0]{ "typeRef": productType._ref }`,
              { id: categoryRef._ref.replace(/^drafts\./, "") }
            );

            if (
              categoryDoc?.typeRef &&
              categoryDoc.typeRef.replace(/^drafts\./, "") !==
                productClassificationRef.replace(/^drafts\./, "")
            ) {
              return "Selected category belongs to a different Product Classification than the one assigned to this product.";
            }

            return true;
          }),
    }),
    defineField({
      name: "description",
      title: "Product Description",
      type: "text",
      group: "main",
      description:
        "Full description, condition, usage details, what's included, any defects (min 50 chars)",
      validation: (Rule) =>
        Rule.required()
          .min(50)
          .error("Product description must be at least 50 characters long."),
    }),
    defineField({
      name: "highlights",
      title: "Highlights / Key Features",
      type: "array",
      group: "main",
      description:
        "List 3 to 8 key bullet points for quick display on product page (max 120 chars each)",
      of: [
        {
          type: "string",
          validation: (Rule) =>
            Rule.max(120).error("Each highlight must be max 120 characters."),
        },
      ],
      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(8)
          .error("Provide between 3 and 8 key highlight bullet points."),
    }),
    defineField({
      name: "price",
      title: "Price (GHS)",
      type: "number",
      group: "main",
      description: "Base listing price in GHS (must be > 0)",
      validation: (Rule) =>
        Rule.required().positive().error("Price must be greater than 0."),
    }),
    defineField({
      name: "discount",
      title: "Discount Percentage (%)",
      type: "number",
      group: "main",
      description: "Optional discount percentage (1–90%). Displayed as 'X% off'",
      validation: (Rule) =>
        Rule.min(1)
          .max(90)
          .integer()
          .error("Discount percentage must be an integer between 1% and 90%."),
    }),
    defineField({
      name: "status",
      title: "Condition",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Refurbished", value: "refurbished" },
          { title: "Used - Like New", value: "like_new" },
          { title: "Used - Excellent", value: "excellent" },
          { title: "Used - Good", value: "good" },
          { title: "Used - Fair", value: "fair" },
          { title: "Used - For Parts", value: "for_parts" },
        ],
      },
    }),
    defineField({
      name: "featured",
      title: "Featured Product",
      type: "boolean",
      group: "main",
      description: "Toggle featured placement on homepage/shop",
      initialValue: false,
    }),
    defineField({
      name: "isFlashSale",
      title: "Flash Sale / Daily Deal",
      type: "boolean",
      group: "main",
      description: "Toggle flash sale / daily deal showcase on the homepage",
      initialValue: false,
    }),
    defineField({
      name: "isStudentDeal",
      title: "Student Deal",
      type: "boolean",
      group: "main",
      description: "Toggle student discount showcase",
      initialValue: false,
    }),
    defineField({
      name: "isClearance",
      title: "Clearance Sale Item",
      type: "boolean",
      group: "main",
      description: "Toggle clearance warehouse markdown",
      initialValue: false,
    }),
    defineField({
      name: "isBlackFriday",
      title: "Black Friday Mega Deal",
      type: "boolean",
      group: "main",
      description: "Toggle Black Friday shopping event promotion",
      initialValue: false,
    }),
    defineField({
      name: "isSpecialOffer",
      title: "Special Promotional Offer",
      type: "boolean",
      group: "main",
      description: "Toggle curated special offer / bundle discount",
      initialValue: false,
    }),

    // ─── TAB 2: ADDITIONAL INFORMATION (SPECS TAB) ──────────────
    defineField({
      name: "attributeValues",
      title: "Category Attribute Values",
      type: "array",
      group: "specs",
      description:
        "Structured attribute values based on the selected category's defined attributes.",
      of: [
        {
          type: "object",
          name: "attributeValue",
          title: "Attribute Value",
          fields: [
            defineField({
              name: "attribute",
              title: "Attribute",
              type: "reference",
              to: [{ type: "attribute" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "valueString",
              title: "Text Value",
              type: "string",
            }),
            defineField({
              name: "valueNumber",
              title: "Number Value",
              type: "number",
            }),
            defineField({
              name: "valueBoolean",
              title: "Boolean Value",
              type: "boolean",
            }),
            defineField({
              name: "valueSelect",
              title: "Selected Option",
              type: "string",
            }),
            defineField({
              name: "valueMultiSelect",
              title: "Selected Options",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: {
              title: "attribute.title",
              type: "attribute.type",
              unit: "attribute.unit",
              valueString: "valueString",
              valueNumber: "valueNumber",
              valueBoolean: "valueBoolean",
              valueSelect: "valueSelect",
              valueMultiSelect: "valueMultiSelect",
            },
            prepare(selection) {
              const {
                title,
                type,
                unit,
                valueString,
                valueNumber,
                valueBoolean,
                valueSelect,
                valueMultiSelect,
              } = selection;

              let displayVal: string | undefined;
              if (valueString !== undefined && valueString !== null && valueString !== "") {
                displayVal = String(valueString);
              } else if (valueNumber !== undefined && valueNumber !== null) {
                displayVal = `${valueNumber}${unit ? " " + unit : ""}`;
              } else if (valueBoolean !== undefined && valueBoolean !== null) {
                displayVal = valueBoolean ? "Yes" : "No";
              } else if (valueSelect) {
                displayVal = `${valueSelect}${unit ? " " + unit : ""}`;
              } else if (Array.isArray(valueMultiSelect) && valueMultiSelect.length > 0) {
                displayVal = valueMultiSelect.join(", ");
              }

              const subtitle = [displayVal || "(no value)", type ? `[${type}]` : null]
                .filter(Boolean)
                .join(" · ");

              return {
                title: title || "(select attribute)",
                subtitle,
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom(async (attributeValues: unknown, context) => {
          const { document, getClient } = context;
          const categoryRef = (document?.category as { _ref?: string } | undefined)
            ?._ref;

          if (!categoryRef) {
            return true;
          }

          const client = getClient({ apiVersion: "2026-07-07" });

          const categoryDoc = await client.fetch(
            `*[_id == $id || _id == "drafts." + $id][0]{
              attributes[]{
                required,
                "attributeRef": attribute._ref
              }
            }`,
            { id: categoryRef.replace(/^drafts\./, "") }
          );

          if (!categoryDoc?.attributes || categoryDoc.attributes.length === 0) {
            return true;
          }

          const requiredAttrRefs: string[] = categoryDoc.attributes
            .filter(
              (attr: { required?: boolean; attributeRef?: string }) =>
                attr.required && attr.attributeRef
            )
            .map((attr: { attributeRef: string }) =>
              attr.attributeRef.replace(/^drafts\./, "")
            );

          if (requiredAttrRefs.length === 0) {
            return true;
          }

          const filledAttrRefs = new Set<string>();
          if (Array.isArray(attributeValues)) {
            const items = attributeValues as AttributeValueItem[];
            for (const item of items) {
              const ref = item?.attribute?._ref?.replace(/^drafts\./, "");

              if (ref) {
                const hasValue =
                  (item.valueString !== undefined &&
                    item.valueString !== null &&
                    item.valueString !== "") ||
                  (item.valueNumber !== undefined && item.valueNumber !== null) ||
                  (item.valueBoolean !== undefined && item.valueBoolean !== null) ||
                  !!item.valueSelect ||
                  (Array.isArray(item.valueMultiSelect) &&
                    item.valueMultiSelect.length > 0);

                if (hasValue) {
                  filledAttrRefs.add(ref);
                }
              }
            }
          }

          const missingRefs = requiredAttrRefs.filter(
            (ref) => !filledAttrRefs.has(ref)
          );

          if (missingRefs.length > 0) {
            const missingAttrs = await client.fetch(
              `*[_id in $missingRefs]{ title }`,
              { missingRefs }
            );
            const titles = missingAttrs
              .map((a: { title: string }) => a.title)
              .join(", ");
            return `Missing required category attribute(s): ${
              titles || missingRefs.join(", ")
            }`;
          }

          return true;
        }),
    }),
    defineField({
      name: "attributes",
      title: "Category Legacy Specs",
      type: "object",
      group: "specs",
      description:
        "Legacy technical attributes object",
      fields: [
        defineField({
          name: "condition",
          title: "Detailed Condition",
          type: "string",
          options: {
            list: [
              { title: "New", value: "new" },
              { title: "Refurbished", value: "refurbished" },
              { title: "Used - Like New", value: "like_new" },
              { title: "Used - Good", value: "good" },
              { title: "Used - Fair", value: "fair" },
              { title: "Used - For Parts", value: "for_parts" },
            ],
          },
        }),
        defineField({
          name: "modelSeries",
          title: "Model / Series",
          type: "string",
          description: "e.g., 'ProBook 450 G8' or 'Galaxy S24 Ultra'",
        }),
        defineField({
          name: "os",
          title: "Operating System",
          type: "string",
          description: "e.g., Android, iOS, Windows 11, macOS, Linux, None",
        }),
        defineField({
          name: "network",
          title: "Network Connectivity",
          type: "array",
          of: [{ type: "string" }],
          options: {
            list: [
              { title: "2G", value: "2G" },
              { title: "3G", value: "3G" },
              { title: "4G LTE", value: "4G" },
              { title: "5G", value: "5G" },
              { title: "Wi-Fi Only", value: "wifi" },
            ],
          },
        }),
        defineField({
          name: "screenSize",
          title: "Screen Size (inches)",
          type: "string",
          description: "e.g., '15.6\"' or '6.7\"'",
        }),
        defineField({
          name: "resolution",
          title: "Resolution",
          type: "string",
          options: {
            list: [
              { title: "HD (720p)", value: "HD" },
              { title: "Full HD (1080p)", value: "Full HD" },
              { title: "4K UHD", value: "4K" },
              { title: "8K", value: "8K" },
              { title: "Other", value: "Other" },
            ],
          },
        }),
        defineField({
          name: "smartTv",
          title: "Smart TV",
          type: "boolean",
        }),
        defineField({
          name: "hdrSupport",
          title: "HDR Support",
          type: "boolean",
        }),
        defineField({
          name: "cpuBrand",
          title: "CPU Brand",
          type: "string",
          options: {
            list: [
              { title: "Intel", value: "Intel" },
              { title: "AMD", value: "AMD" },
              { title: "Apple Silicon", value: "Apple" },
              { title: "Qualcomm", value: "Qualcomm" },
              { title: "MediaTek", value: "MediaTek" },
              { title: "Other", value: "Other" },
            ],
          },
        }),
        defineField({
          name: "cpuModel",
          title: "CPU Model",
          type: "string",
          description: "e.g., 'Core i5-1135G7' or 'M3 Pro'",
        }),
        defineField({
          name: "ram",
          title: "RAM / Memory",
          type: "string",
          description: "e.g., '8GB', '16GB', '32GB'",
        }),
        defineField({
          name: "storageType",
          title: "Storage Type",
          type: "string",
          options: {
            list: [
              { title: "SSD", value: "SSD" },
              { title: "HDD", value: "HDD" },
              { title: "SSD + HDD", value: "SSD+HDD" },
              { title: "NVMe SSD", value: "NVMe" },
              { title: "eMMC / Flash", value: "eMMC" },
              { title: "Other", value: "Other" },
            ],
          },
        }),
        defineField({
          name: "storageCapacity",
          title: "Storage Capacity",
          type: "string",
          description: "e.g., '128GB', '256GB', '512GB', '1TB'",
        }),
        defineField({
          name: "gpu",
          title: "Graphics / GPU",
          type: "string",
          description: "e.g., 'NVIDIA RTX 4060 8GB' or 'Integrated Intel Iris Xe'",
        }),
        defineField({
          name: "batteryCapacity",
          title: "Battery Capacity (mAh / Wh)",
          type: "string",
          description: "e.g., '5000 mAh' or '70Wh'",
        }),
        defineField({
          name: "power",
          title: "Power Output (W)",
          type: "string",
          description: "e.g., '1000W', '65W'",
        }),
        defineField({
          name: "capacity",
          title: "Capacity (L / kg)",
          type: "string",
          description: "e.g., '1.5 L' or '7 kg'",
        }),
        defineField({
          name: "speedSettings",
          title: "Speed Settings / Controls",
          type: "string",
        }),
        defineField({
          name: "printTechnology",
          title: "Print Technology",
          type: "string",
          description: "e.g., Inkjet, Laser, Thermal, Dot Matrix",
        }),
        defineField({
          name: "functions",
          title: "Printer/Scanner Functions",
          type: "array",
          of: [{ type: "string" }],
          options: {
            list: [
              { title: "Print", value: "Print" },
              { title: "Scan", value: "Scan" },
              { title: "Copy", value: "Copy" },
              { title: "Fax", value: "Fax" },
            ],
          },
        }),
        defineField({
          name: "connectivity",
          title: "Connectivity Options",
          type: "array",
          of: [{ type: "string" }],
          options: {
            list: [
              { title: "Bluetooth", value: "Bluetooth" },
              { title: "Wi-Fi", value: "Wi-Fi" },
              { title: "USB-C", value: "USB-C" },
              { title: "USB-A", value: "USB-A" },
              { title: "AUX / 3.5mm", value: "AUX" },
              { title: "Ethernet / LAN", value: "Ethernet" },
              { title: "HDMI", value: "HDMI" },
            ],
          },
        }),
        defineField({
          name: "color",
          title: "Color",
          type: "string",
        }),
        defineField({
          name: "boxAndAccessories",
          title: "Box & Included Accessories",
          type: "text",
          description: "List what's included in the box (cables, charger, manuals, etc.)",
        }),
        defineField({
          name: "customAttributes",
          title: "Custom Specs",
          type: "array",
          description: "Additional key-value specifications",
          of: [
            {
              type: "object",
              fields: [
                { name: "name", title: "Spec Name", type: "string" },
                { name: "value", title: "Spec Value", type: "string" },
              ],
            },
          ],
        }),
      ],
    }),

    // ─── TAB 3: PRICING, INVENTORY & WARRANTY ───────────────────
    defineField({
      name: "store",
      title: "Store / Seller",
      type: "reference",
      group: "inventory_warranty",
      to: [{ type: "store" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sellerSku",
      title: "Seller SKU",
      type: "string",
      group: "inventory_warranty",
      description: "Seller internal inventory code/ID (max 64 chars)",
      validation: (Rule) =>
        Rule.required().max(64).error("Seller SKU is required (max 64 characters)."),
    }),
    defineField({
      name: "stock",
      title: "Quantity (Stock)",
      type: "number",
      group: "inventory_warranty",
      initialValue: 0,
      validation: (Rule) =>
        Rule.required()
          .min(0)
          .integer()
          .error("Stock quantity must be a non-negative integer."),
    }),
    defineField({
      name: "warrantyType",
      title: "Warranty Type",
      type: "string",
      group: "inventory_warranty",
      options: {
        list: [
          { title: "No Warranty", value: "no_warranty" },
          { title: "Seller Warranty", value: "seller_warranty" },
          { title: "Manufacturer Warranty", value: "manufacturer_warranty" },
        ],
      },
      initialValue: "no_warranty",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "warrantyDuration",
      title: "Warranty Duration (Months)",
      type: "number",
      group: "inventory_warranty",
      description: "Warranty duration in months (if warranty type is not 'No Warranty')",
      hidden: ({ parent }) => parent?.warrantyType === "no_warranty",
      validation: (Rule) =>
        Rule.custom((duration, context: ValidationContext) => {
          const parent = context.parent as { warrantyType?: string } | undefined;
          if (parent?.warrantyType !== "no_warranty" && (!duration || (duration as number) < 1)) {
            return "Please specify warranty duration in months (minimum 1).";
          }
          return true;
        }),
    }),
    defineField({
      name: "warrantyDescription",
      title: "Warranty Description",
      type: "text",
      group: "inventory_warranty",
      description:
        "What is covered, where to claim, conditions, and exclusions (max 500 chars)",
      hidden: ({ parent }) => parent?.warrantyType === "no_warranty",
      validation: (Rule) => Rule.max(500).error("Warranty description max length is 500 chars."),
    }),
    defineField({
      name: "freeTechSupport",
      title: "Free Tech Support",
      type: "boolean",
      group: "inventory_warranty",
      description: "Tick if you offer free technical support to buyers of this product.",
      initialValue: false,
    }),

    // ─── TAB 4: IMAGES ──────────────────────────────────────────
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      group: "images",
      description:
        "1 to 8 high quality images. First image is main listing thumbnail.",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
        {
          type: "object",
          name: "imagekitAsset",
          title: "ImageKit Asset",
          fields: [
            defineField({ name: "url", title: "ImageKit URL", type: "url" }),
            defineField({ name: "fileId", title: "File ID", type: "string" }),
            defineField({ name: "filePath", title: "File Path", type: "string" }),
            defineField({ name: "thumbnailUrl", title: "Thumbnail URL", type: "url" }),
          ],
        },
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(8)
          .error("Upload between 1 and 8 product images."),
    }),

    // ─── TAB 5: REVIEWS & RATINGS (SYSTEM METRICS) ─────────────
    defineField({
      name: "averageRating",
      title: "Average Rating",
      type: "number",
      group: "reviews",
      readOnly: true,
      description: "Calculated average rating from approved reviews",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "totalReviews",
      title: "Total Reviews",
      type: "number",
      group: "reviews",
      readOnly: true,
      initialValue: 0,
      description: "Total number of approved reviews",
    }),
    defineField({
      name: "ratingDistribution",
      title: "Rating Distribution",
      type: "object",
      group: "reviews",
      readOnly: true,
      description: "Distribution of ratings (1-5 stars)",
      fields: [
        defineField({
          name: "fiveStars",
          title: "5 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "fourStars",
          title: "4 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "threeStars",
          title: "3 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "twoStars",
          title: "2 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "oneStar",
          title: "1 Star",
          type: "number",
          initialValue: 0,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "price",
      media: "images",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      const image = media && media[0];
      return {
        title: title,
        subtitle: subtitle ? `₵${subtitle}` : "",
        media: image,
      };
    },
  },
});
