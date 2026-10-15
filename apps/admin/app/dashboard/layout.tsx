import AdminShell from "@/components/shell/AdminShell";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = await verifyIsAdmin(userId);
  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AdminShell>{children}</AdminShell>
      </ThemeProvider>
      <ToastContainer position="bottom-right" />
    </QueryProvider>
  );
}
