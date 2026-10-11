import type { Metadata } from "next";
import Container from "@/components/Container";
import UnsubscribeClient from "./UnsubscribeClient";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;
  return (
    <Container className="py-16">
      <UnsubscribeClient email={email ?? ""} token={token ?? ""} />
    </Container>
  );
}
