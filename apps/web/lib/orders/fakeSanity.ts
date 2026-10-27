/**
 * In-memory stand-in for the parts of the Sanity client the stock code uses, with
 * Sanity's real concurrency rules: `ifRevisionId` mismatches and creating an
 * existing `_id` both fail with HTTP 409, and a transaction is all-or-nothing.
 * Every call yields to the event loop first so concurrent callers interleave
 * (both read the same revisions before either commits), which is exactly the race
 * the reservation logic has to survive. Test-only.
 */
type Doc = Record<string, any> & { _id: string; _type: string; _rev: string };
const tick = () => new Promise<void>((r) => setImmediate(r));
const conflict = (m: string) => Object.assign(new Error(m), { statusCode: 409 });

export function createFakeSanity(seed: Array<Record<string, any>> = []) {
  const docs = new Map<string, Doc>();
  let rev = 0;
  let autoId = 0;
  for (const d of seed) docs.set(d._id, { ...d, _rev: `r${rev++}` } as Doc);

  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
  const all = (type: string) => [...docs.values()].filter((d) => d._type === type);

  function applyPatchOps(doc: Doc, ops: { set?: any; setIfMissing?: any; inc?: any }) {
    if (ops.setIfMissing) for (const [k, v] of Object.entries(ops.setIfMissing)) if (doc[k] == null) doc[k] = v;
    if (ops.set) Object.assign(doc, ops.set);
    if (ops.inc) for (const [k, v] of Object.entries(ops.inc)) doc[k] = (Number(doc[k]) || 0) + Number(v);
  }
  const makePatch = () => {
    const state: { rev?: string; set?: any; setIfMissing?: any; inc?: any } = {};
    const b: any = {
      ifRevisionId: (r: string) => ((state.rev = r), b),
      set: (o: any) => ((state.set = { ...state.set, ...o }), b),
      setIfMissing: (o: any) => ((state.setIfMissing = { ...state.setIfMissing, ...o }), b),
      inc: (o: any) => ((state.inc = { ...state.inc, ...o }), b),
    };
    return { b, state };
  };

  function commitOps(ops: Array<any>, returnDocuments: boolean) {
    // validate everything first (atomic)
    const staged = new Map<string, Doc>();
    for (const op of ops) {
      if (op.kind === "create") {
        if (op.doc._id && (docs.has(op.doc._id) || staged.has(op.doc._id))) throw conflict("Document already exists");
      } else {
        const cur = docs.get(op.id);
        if (!cur) throw Object.assign(new Error("Document not found"), { statusCode: 404 });
        if (op.state.rev && op.state.rev !== cur._rev) throw conflict("Revision mismatch");
      }
    }
    const out: Doc[] = [];
    for (const op of ops) {
      if (op.kind === "create") {
        const d = { ...clone(op.doc), _id: op.doc._id ?? `auto-${++autoId}`, _rev: `r${rev++}` } as Doc;
        docs.set(d._id, d);
        out.push(clone(d));
      } else {
        const d = docs.get(op.id)!;
        applyPatchOps(d, op.state);
        d._rev = `r${rev++}`;
        out.push(clone(d));
      }
    }
    return returnDocuments ? out : { results: out };
  }

  const db = {
    async fetch(query: string, params: Record<string, any> = {}) {
      await tick();
      if (query.includes("stockReserved == true") && query.includes("$cutoff")) {
        return all("order")
          .filter(
            (o) =>
              o.stockReserved === true && o.paymentStatus === params.unpaid && o.orderStatus === params.pending &&
              o.paymentGateway === params.gateway && o.orderDate < params.cutoff &&
              (o.items ?? []).some((i: any) => params.ids.includes(i.product?._ref))
          )
          .map((o) => ({ _id: o._id, _rev: o._rev }));
      }
      if (query.includes('_type == "product" && _id in $ids]._id')) {
        return all("product").filter((p) => params.ids.includes(p._id)).map((p) => p._id);
      }
      if (query.includes('_type == "product" && _id in $ids]')) {
        return clone(all("product").filter((p) => params.ids.includes(p._id)).map((p) => ({ _id: p._id, _rev: p._rev, name: p.name, stock: p.stock })));
      }
      if (query.includes('_type == "order" && _id == $id][0]{ _id, _rev, stockReserved')) {
        const o = docs.get(params.id);
        return o ? { _id: o._id, _rev: o._rev, stockReserved: o.stockReserved, items: (o.items ?? []).map((i: any) => ({ quantity: i.quantity, productId: i.product?._ref })) } : null;
      }
      if (query.includes('_type == "order" && _id == $id][0]')) {
        const o = docs.get(params.id);
        return o ? clone(o) : null;
      }
      throw new Error(`fakeSanity: unhandled query ${query.slice(0, 80)}`);
    },
    transaction() {
      const ops: any[] = [];
      const tx: any = {
        patch(id: string, fn: (p: any) => any) {
          const { b, state } = makePatch();
          fn(b);
          ops.push({ kind: "patch", id, state });
          return tx;
        },
        create(doc: any) {
          ops.push({ kind: "create", doc });
          return tx;
        },
        async commit(opts: { returnDocuments?: boolean } = {}) {
          await tick();
          return commitOps(ops, !!opts.returnDocuments);
        },
      };
      return tx;
    },
    patch(id: string) {
      const { b, state } = makePatch();
      b.commit = async () => {
        await tick();
        return commitOps([{ kind: "patch", id, state }], true);
      };
      return b;
    },
  };

  return { db: db as any, docs, all };
}
