import { defineLive } from "next-sanity/live";
import { client } from "./client";

// The server token stays server-side. The BROWSER token is shipped to visitors'
// browsers (draft mode), so it must only ever be a dedicated read-only "Viewer"
// token. It used to fall back to SANITY_API_TOKEN, which is the same write-capable
// token the server uses for orders, wallets and products: if SANITY_API_READ_TOKEN
// was unset, a write token was handed to the public.
const serverToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;
const browserToken = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
  browserToken,
});
