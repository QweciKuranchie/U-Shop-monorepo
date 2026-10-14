export const dynamic = "force-dynamic";

import { writeClient } from "@repo/sanity";
import HomepageBannerManager, { type BannerRow } from "@/components/HomepageBannerManager";
import { BANNER_PROJECTION } from "@/lib/homepageBannerApi";

export default async function HomepagePage() {
  let banners: BannerRow[] = [];
  try {
    banners = await writeClient.fetch<BannerRow[]>(
      `*[_type == "homepageBanner"] | order(placement asc, order asc, _createdAt asc) ${BANNER_PROJECTION}`
    );
  } catch (error) {
    console.error("Error loading homepage banners:", error);
  }
  return (
    <div className="py-4 space-y-6">
      <div className="px-4 py-3 bg-card border rounded-lg shadow-xs">
        <h1 className="font-semibold text-lg">Homepage banners</h1>
        <p className="text-xs text-muted-foreground">
          Manage what shows on the storefront homepage. Sections with no active banners show the built-in defaults.
          Changes appear within a few minutes (instantly if the Sanity webhook is set up).
        </p>
      </div>
      <HomepageBannerManager banners={banners} />
    </div>
  );
}
