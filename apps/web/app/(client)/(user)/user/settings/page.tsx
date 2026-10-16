"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Trash2, Download } from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
 } from "@repo/ui";
import { Button } from "@repo/ui";
import { Switch } from "@repo/ui";
import { Label } from "@repo/ui";
import { Separator } from "@repo/ui";
import { toast } from "sonner";
import NewsletterSubscription from "@/components/profile/NewsletterSubscription";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function UserSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    marketingEmails: false,
    twoFactorAuth: false,
    profileVisibility: true,
  });

  const { requestPermission, clearToken, isLoading: isPushLoading } = usePushNotifications();

  useEffect(() => {
    let isMounted = true;
    async function loadPreferences() {
      try {
        const response = await fetch("/api/user/combined-data");
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.preferences) {
            setSettings((prev) => ({
              ...prev,
              emailNotifications: data.preferences.emailNotifications !== false,
              pushNotifications: data.preferences.pushNotifications === true,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSettingChange = async (key: string, value: boolean) => {
    // Save previous state for revert if needed
    const previousValue = settings[key as keyof typeof settings];
    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      if (key === "pushNotifications") {
        if (value) {
          const result = await requestPermission();
          if (result.permissionDenied) {
            toast.error("Notification permission denied in browser");
            setSettings((prev) => ({ ...prev, pushNotifications: false }));
            return;
          }
          if (result.tokenError) {
            toast.error("Failed to register browser push notifications");
            setSettings((prev) => ({ ...prev, pushNotifications: false }));
            return;
          }
        } else {
          await clearToken();
        }
      }

      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: { [key]: value } }),
      });

      if (response.ok) {
        toast.success("Settings updated successfully");
      } else {
        setSettings((prev) => ({ ...prev, [key]: previousValue }));
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      setSettings((prev) => ({ ...prev, [key]: previousValue }));
      toast.error("Failed to update settings");
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/user/export-data");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "user-data.json";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data exported successfully");
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch("/api/user/delete-account", {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Account deletion initiated");
          // Redirect to sign out or home page
        } else {
          toast.error("Failed to delete account");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage your account preferences and privacy settings
        </p>
      </div>

      {/* Notification Settings */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Bell className="mr-2 h-5 w-5 text-ushop-pink" />
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-500">
            Choose how you want to be notified about account activity
          </p>
        </div>

        <div className="space-y-4 divide-y divide-gray-100">
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-gray-800">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <Switch
              disabled={loading}
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-gray-800">Push Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch
              disabled={loading || isPushLoading}
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("pushNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-gray-800">Order Updates</Label>
              <p className="text-sm text-gray-500">
                Get notified about order status changes
              </p>
            </div>
            <Switch
              checked={settings.orderUpdates}
              onCheckedChange={(checked) =>
                handleSettingChange("orderUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-gray-800">Marketing Emails</Label>
              <p className="text-sm text-gray-500">
                Receive promotional offers and updates
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) =>
                handleSettingChange("marketingEmails", checked)
              }
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Security Settings */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-ushop-pink" />
            Security & Privacy
          </h2>
          <p className="text-sm text-gray-500">
            Manage your account security and privacy preferences
          </p>
        </div>

        <div className="space-y-4 divide-y divide-gray-100">
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-gray-800">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) =>
                handleSettingChange("twoFactorAuth", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-gray-800">Profile Visibility</Label>
              <p className="text-sm text-gray-500">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              checked={settings.profileVisibility}
              onCheckedChange={(checked) =>
                handleSettingChange("profileVisibility", checked)
              }
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Newsletter Subscription */}
      <NewsletterSubscription />

      <Separator />

      {/* Data Management */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Download className="mr-2 h-5 w-5 text-ushop-pink" />
            Data Management
          </h2>
          <p className="text-sm text-gray-500">Export or delete your account data</p>
        </div>

        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-gray-800">Export Data</Label>
              <p className="text-sm text-gray-500">
                Download a copy of your account data
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData} className="rounded-xl">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="rounded-2xl border border-red-200/80 bg-red-50/60 p-5">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  Delete Account
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3 rounded-xl"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
