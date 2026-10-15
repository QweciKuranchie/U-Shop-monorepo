import Link from "next/link";
import { ExternalLink } from "lucide-react";

export interface ListCardItem {
  id: string;
  name: string;
  subtitle: string;
  primary: string;
  secondary?: string;
}

interface ListCardProps {
  title: string;
  viewAllHref: string;
  items: ListCardItem[];
  emptyText: string;
}

const ListCard = ({ title, viewAllHref, items, emptyText }: ListCardProps) => (
  <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
    <div className="flex items-center justify-between border-b p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link href={viewAllHref} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300">
        View all <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
    {items.length === 0 ? (
      <p className="px-4 py-12 text-center text-sm text-muted-foreground">{emptyText}</p>
    ) : (
      <ul className="divide-y">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground" aria-hidden="true">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium tabular-nums">{item.primary}</p>
              {item.secondary && <p className="text-xs text-muted-foreground">{item.secondary}</p>}
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ListCard;
