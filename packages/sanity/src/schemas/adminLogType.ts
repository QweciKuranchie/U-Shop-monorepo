import { defineType, defineField } from "sanity";
import { ActivityIcon } from "@sanity/icons";

/**
 * Append-only audit/activity log written by the admin app
 * (see apps/admin/lib/adminLog.ts). Read-only in Studio.
 */
export const adminLogType = defineType({
  name: "adminLog",
  title: "Admin Log",
  type: "document",
  icon: ActivityIcon,
  readOnly: true,
  fields: [
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      options: {
        list: [
          { title: "Info", value: "info" },
          { title: "Warning", value: "warn" },
          { title: "Error", value: "error" },
          { title: "Debug", value: "debug" },
        ],
      },
      initialValue: "info",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "actorClerkId",
      title: "Actor (Clerk user ID)",
      type: "string",
    }),
    defineField({
      name: "context",
      title: "Context (JSON)",
      type: "text",
      description: "JSON-encoded details about the action.",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "message", subtitle: "level", date: "createdAt" },
    prepare({ title, subtitle, date }) {
      return { title, subtitle: `${subtitle ?? ""} · ${date ?? ""}` };
    },
  },
});
