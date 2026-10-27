import { defineLive } from "next-sanity/live";
import { client } from "./client";

// Server token only. NO `browserToken`: the dataset is private, so a token handed
// to the browser (draft mode) would let any visitor who can reach it read every
// order, wallet and KYC record. Nothing in the app uses draft mode.
const serverToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
});
