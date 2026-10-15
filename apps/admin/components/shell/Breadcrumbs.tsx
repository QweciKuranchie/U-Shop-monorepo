"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const label = (segment: string) => {
  const s = decodeURIComponent(segment);
  // Record ids are not readable; show a generic label instead.
  return s.length > 20 ? "Details" : s.replace(/-/g, " ");
};

const Breadcrumbs = () => {
  const pathname = usePathname() ?? "/admin";
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "admin"

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          {segments.length === 0 ? (
            <span aria-current="page" className="font-semibold text-foreground">Dashboard</span>
          ) : (
            <Link href="/admin" className="font-medium hover:text-indigo-600">Dashboard</Link>
          )}
        </li>
        {segments.map((seg, i) => {
          const href = "/admin/" + segments.slice(0, i + 1).join("/");
          const last = i === segments.length - 1;
          return (
            <React.Fragment key={href}>
              <li aria-hidden="true">/</li>
              <li>
                {last ? (
                  <span aria-current="page" className="font-semibold capitalize text-foreground">{label(seg)}</span>
                ) : (
                  <Link href={href} className="font-medium capitalize hover:text-indigo-600">{label(seg)}</Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
