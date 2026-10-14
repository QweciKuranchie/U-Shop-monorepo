import { writeClient } from "@repo/sanity";

/** Number of documents of each type that reference `id`. */
export async function countReferences(id: string): Promise<Record<string, number>> {
  const rows = await writeClient.fetch<Array<{ type: string }>>(
    `*[references($id) && !(_id in path("drafts.**"))]{ "type": _type }`,
    { id }
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.type] = (out[r.type] ?? 0) + 1;
  return out;
}

export const describeRefs = (refs: Record<string, number>): string =>
  Object.entries(refs)
    .map(([t, n]) => `${n} ${t}${n === 1 ? "" : "s"}`)
    .join(", ");
