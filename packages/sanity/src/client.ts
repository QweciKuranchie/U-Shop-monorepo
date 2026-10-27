import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

// SERVER-ONLY read token. The dataset is PRIVATE (it holds orders, wallets, KYC
// details, contact messages), so every read must be authenticated. This is a
// plain (non-NEXT_PUBLIC) env var: Next.js never inlines it into browser bundles,
// so in the browser it is undefined and browser code cannot read Sanity directly.
// Never read Sanity from a "use client" component: go through a route handler
// (see apps/web/lib/noBrowserSanityReads.test.ts, which enforces it).
// Use a Viewer-role token here, not the write token.
const readToken = process.env.SANITY_API_READ_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: readToken,
  // The API CDN is for anonymous reads of public datasets; authenticated reads go
  // to the live API.
  useCdn: !readToken,
  stega: {
    studioUrl:
      process.env.NODE_ENV === "production"
        ? "https://sanity.ushopgh.com"
        : "http://localhost:3333",
  },
});

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

export const backendClient = writeClient;

