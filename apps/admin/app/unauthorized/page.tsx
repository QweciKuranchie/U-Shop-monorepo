"use client";

import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@repo/ui";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your account does not have administrator privileges required to access the UShop Admin Control Panel.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <SignOutButton redirectUrl="/sign-in">
            <Button variant="outline" className="w-full sm:w-auto">
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with another account
            </Button>
          </SignOutButton>
          <Button asChild variant="default" className="w-full sm:w-auto">
            <a href={process.env.NEXT_PUBLIC_BASE_URL || "https://ushopgh.com"}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to UShop
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
