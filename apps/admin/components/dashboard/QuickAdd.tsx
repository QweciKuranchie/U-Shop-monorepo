"use client";

import { Plus } from "lucide-react";
import { Button, Sheet, SheetTrigger } from "@repo/ui";
import AddProduct from "@/components/AddProduct";
import AddCategory from "@/components/AddCategory";
import AddUser from "@/components/AddUser";
import AddOrder from "@/components/AddOrder";

const ACTIONS = [
  { label: "Add product", Form: AddProduct },
  { label: "Add category", Form: AddCategory },
  { label: "Add user", Form: AddUser },
  { label: "Add order", Form: AddOrder },
] as const;

/** Shortcuts that used to live in the sidebar. */
const QuickAdd = () => (
  <div className="flex flex-wrap gap-2">
    {ACTIONS.map(({ label, Form }) => (
      <Sheet key={label}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            {label}
          </Button>
        </SheetTrigger>
        <Form />
      </Sheet>
    ))}
  </div>
);

export default QuickAdd;
