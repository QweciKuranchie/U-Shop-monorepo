"use client";

import { Button } from "@repo/ui";
import { Checkbox } from "@repo/ui";
import { ProductType } from "@/types/admin";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import ProductActionsCell from "@/components/ProductActionsCell";

export const columns: ColumnDef<ProductType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          table.getIsSomePageRowsSelected()
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const product = row.original;
      let imgSrc = "";
      if (product.images && typeof product.images === "object") {
        imgSrc = Object.values(product.images)[0] as string;
      }
      return (
        <div className="w-10 h-10 relative bg-muted rounded-md overflow-hidden flex-shrink-0">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
              No img
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="font-medium max-w-[280px] truncate block">
          {row.getValue("name")}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
      }).format(price);

      return <span className="font-semibold">{formatted}</span>;
    },
  },
  {
    accessorKey: "categorySlug",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original.categorySlug || row.original.category?.title;
      const brand = row.original.brand?.name;
      return (
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-medium bg-muted px-2 py-0.5 rounded w-fit">
            {cat || "General"}
          </span>
          {brand && (
            <span className="text-[11px] text-muted-foreground">
              Brand: <strong className="text-foreground">{brand}</strong>
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status / Condition",
    cell: ({ row }) => {
      const status = row.original.status || "new";
      const condition = row.original.condition || "new";
      const stock = row.original.stock ?? 1;

      return (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                status === "hot"
                  ? "bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-900"
                  : status === "new"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-900"
                  : "bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900"
              }`}
            >
              {status.replace("_", " ")}
            </span>
            <span className="text-[11px] text-muted-foreground capitalize">
              ({condition})
            </span>
          </div>
          <span className={`text-[11px] ${stock <= 3 ? "text-rose-500 font-medium" : "text-muted-foreground"}`}>
            Stock: {stock} units
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductActionsCell product={row.original} />,
  },
];
