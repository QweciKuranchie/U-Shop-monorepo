export const dynamic = "force-dynamic";

import DashboardOverview from "@/components/dashboard/DashboardOverview";
import QuickAdd from "@/components/dashboard/QuickAdd";
import TodoList from "@/components/TodoList";
import { client } from "@repo/sanity";
import { ActionItemType } from "@/types/admin";

interface SanityPendingOrderRecord {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  orderDate?: string;
  _createdAt?: string;
}

interface SanityLowStockProductRecord {
  _id: string;
  name: string;
  stock?: number;
}

async function getStoreActionItems(): Promise<ActionItemType[]> {
  try {
    const [pendingOrders, lowStockProducts]: [
      SanityPendingOrderRecord[],
      SanityLowStockProductRecord[]
    ] = await Promise.all([
      client.fetch(
        `*[_type == "order" && orderStatus == "pending"][0...3] {
          _id,
          orderNumber,
          customerName,
          orderDate,
          _createdAt
        }`
      ),
      client.fetch(
        `*[_type == "product" && (stock <= 5 || !defined(stock))][0...3] {
          _id,
          name,
          stock
        }`
      ),
    ]);

    const tasks: ActionItemType[] = [];

    pendingOrders.forEach((ord) => {
      tasks.push({
        id: `ord-${ord._id}`,
        title: `Dispatch order #${ord.orderNumber || ord._id.slice(0, 8)} (${ord.customerName || "Customer"})`,
        type: "order",
        date: "Action Required",
        isUrgent: true,
      });
    });

    lowStockProducts.forEach((p) => {
      tasks.push({
        id: `stock-${p._id}`,
        title: `Restock '${p.name}' (Current stock: ${p.stock ?? 0})`,
        type: "inventory",
        date: "Inventory Alert",
        isUrgent: (p.stock ?? 0) === 0,
      });
    });

    if (tasks.length === 0) {
      tasks.push({
        id: "healthy-1",
        title: "All orders fulfilled and inventory levels optimal",
        type: "order",
        date: "Up to date",
      });
    }

    return tasks;
  } catch (error) {
    console.error("Error fetching store action items:", error);
    return [];
  }
}

const Homepage = async () => {
  const actionItems = await getStoreActionItems();

  return (
    <div className="space-y-6">
      <QuickAdd />
      <section className="rounded-xl border bg-card p-5 shadow-xs">
        <TodoList actionItems={actionItems} />
      </section>
      <DashboardOverview />
    </div>
  );
};

export default Homepage;
