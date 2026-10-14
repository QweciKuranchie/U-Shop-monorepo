"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {  Button  } from "@repo/ui";
import {  Card, CardContent, CardHeader, CardTitle  } from "@repo/ui";
import {  Badge  } from "@repo/ui";
import {  Separator  } from "@repo/ui";
import {  Avatar, AvatarFallback, AvatarImage  } from "@repo/ui";
import { showToast } from "@/lib/toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Plus,
  Home,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import ProfileEditSidebar from "./ProfileEditSidebar";
import { useAuth } from "@clerk/nextjs";
import AddressEditSidebar from "./AddressEditSidebar";

interface EmailAddress {
  emailAddress: string;
  id: string;
}

interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: EmailAddress[];
  imageUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Address {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  default: boolean;
  type?: string;
  createdAt?: string;
  phone?: string;
}

interface SanityUser {
  _id: string;
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  profileImage?: {
    asset: {
      _id: string;
      url: string;
    };
  };
  addresses?: Address[];
  preferences?: Record<string, unknown>;
  loyaltyPoints?: number;
  rewardPoints?: number;
  totalSpent?: number;
  lastLogin?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileClientProps {
  userData: {
    clerk: ClerkUser;
    sanity: SanityUser | null;
  };
}

export default function ProfileClient({ userData }: ProfileClientProps) {
  const { clerk, sanity } = userData;
  const router = useRouter();
  const { getToken } = useAuth();
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);
  const [addressSidebarOpen, setAddressSidebarOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address state with dynamic API re-fetching
  const [addresses, setAddresses] = useState<Address[]>(
    sanity?.addresses || []
  );
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const token = await getToken().catch(() => null);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/user/addresses", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.addresses) {
          setAddresses(data.addresses);
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
      router.refresh();
    }
  }, [router, getToken]);

  useEffect(() => {
    let ignore = false;
    async function loadAddresses() {
      try {
        const token = await getToken().catch(() => null);
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/user/addresses", { headers });
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.addresses) {
            setAddresses(data.addresses);
          }
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    }
    loadAddresses();
    return () => {
      ignore = true;
    };
  }, [getToken]);

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      setDeletingAddressId(addressId);
      const token = await getToken().catch(() => null);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        showToast.success("Address Deleted", "The address has been removed.");
        await fetchAddresses();
      } else {
        const data = await res.json();
        showToast.error("Error", data.error || "Failed to delete address.");
      }
    } catch (err) {
      console.error("Delete address error:", err);
      showToast.error("Error", "Failed to delete address.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const displayName =
    clerk.firstName && clerk.lastName
      ? `${clerk.firstName} ${clerk.lastName}`
      : sanity?.firstName && sanity?.lastName
      ? `${sanity.firstName} ${sanity.lastName}`
      : clerk.firstName || sanity?.firstName || "User";

  const displayEmail =
    clerk.emailAddresses?.[0]?.emailAddress || sanity?.email || "";

  const handleEditProfile = () => {
    setProfileSidebarOpen(true);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressSidebarOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressSidebarOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <Card className="shadow-lg border border-ushop-pink/15">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-ushop-pink/30">
                <AvatarImage
                  src={clerk.imageUrl || sanity?.profileImage?.asset?.url}
                  alt={displayName}
                />
                <AvatarFallback className="bg-ushop_light_pink text-ushop-purple-dark font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-ushop-purple-dark">
                  {displayName}
                </h1>
                <p className="text-gray-600 flex items-center mt-1 text-sm">
                  <Mail className="h-4 w-4 mr-2 text-ushop-pink" />
                  {displayEmail}
                </p>
                {sanity?.phone && (
                  <p className="text-gray-600 flex items-center mt-1 text-sm">
                    <Phone className="h-4 w-4 mr-2 text-ushop-pink" />
                    {sanity.phone}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleEditProfile}
              className="bg-ushop-pink hover:bg-ushop-magenta text-white font-semibold shadow-sm transition-all flex items-center space-x-2 px-5 py-2.5 rounded-xl"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-3 bg-ushop_light_pink/40 rounded-xl border border-ushop-pink/10">
              <div className="p-2 bg-ushop-purple text-white rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-semibold text-ushop-purple-dark text-sm">
                  {new Date(clerk.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {sanity?.rewardPoints !== undefined && (
              <div className="flex items-center space-x-3 p-3 bg-ushop_light_pink/40 rounded-xl border border-ushop-pink/10">
                <div className="p-2 bg-ushop-purple text-white rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reward Points</p>
                  <p className="font-semibold text-ushop-purple-dark text-sm">
                    {sanity.rewardPoints}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-3 bg-ushop_light_pink/40 rounded-xl border border-ushop-pink/10">
              <div className="p-2 bg-ushop-purple text-white rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Status</p>
                <Badge
                  variant="outline"
                  className="text-ushop-pink border-ushop-pink/30 bg-white font-medium text-xs mt-0.5"
                >
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="shadow-lg border border-ushop-pink/15">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-ushop-purple-dark">
              <User className="h-5 w-5 text-ushop-pink" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  First Name
                </label>
                <p className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {clerk.firstName || "Not provided"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From Clerk (Read-only)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <p className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {clerk.lastName || "Not provided"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From Clerk (Read-only)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {displayEmail}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From Clerk (Read-only)
                </p>
              </div>

              {sanity && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <p className="text-gray-900 bg-white border p-2.5 rounded-lg">
                      {sanity.phone || "Not provided"}
                    </p>
                    <p className="text-xs text-ushop-pink mt-1">
                      Editable in profile
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </label>
                    <p className="text-gray-900 bg-white border p-2.5 rounded-lg">
                      {sanity.dateOfBirth
                        ? new Date(sanity.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                    <p className="text-xs text-ushop-pink mt-1">
                      Editable in profile
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="shadow-lg border border-ushop-pink/15">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-ushop-purple-dark">
              <Shield className="h-5 w-5 text-ushop-pink" />
              <span>Account Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-ushop_light_pink/40 rounded-xl border border-ushop-pink/10">
                <span className="text-gray-700 font-medium">Reward Points</span>
                <span className="font-bold text-ushop-purple-dark text-lg">
                  {sanity?.rewardPoints || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-ushop_light_pink/40 rounded-xl border border-ushop-pink/10">
                <span className="text-gray-700 font-medium">Total Spent</span>
                <span className="font-bold text-ushop-purple-dark text-lg">
                  ${sanity?.totalSpent || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-ushop_light_pink/40 rounded-xl border border-ushop-pink/10">
                <span className="text-gray-700 font-medium">Loyalty Points</span>
                <span className="font-bold text-ushop-purple-dark text-lg">
                  {sanity?.loyaltyPoints || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-700 font-medium">Last Login</span>
                <span className="font-medium text-gray-600">
                  {sanity?.lastLogin
                    ? new Date(sanity.lastLogin).toLocaleDateString()
                    : "Today"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Addresses */}
      <Card className="shadow-lg border border-ushop-pink/15">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center space-x-2 text-ushop-purple-dark">
              <MapPin className="h-5 w-5 text-ushop-pink" />
              <span>Shipping Addresses</span>
              {loadingAddresses && (
                <Loader2 className="w-4 h-4 text-ushop-pink animate-spin ml-2" />
              )}
            </CardTitle>
            <Button
              onClick={handleAddAddress}
              className="bg-ushop-pink hover:bg-ushop-magenta text-white font-semibold shadow-sm transition-all flex items-center space-x-2 px-5 py-2.5 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Add Address</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address._id || address.name}
                  className="border border-gray-200 rounded-xl p-5 space-y-3 hover:shadow-md hover:border-ushop-pink/30 transition-all bg-white flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-ushop-pink" />
                        <span className="font-bold text-ushop-purple-dark">
                          {address.name}
                        </span>
                      </div>
                      {address.default && (
                        <Badge
                          variant="outline"
                          className="text-ushop-pink border-ushop-pink/30 bg-ushop_light_pink/50 font-semibold text-xs"
                        >
                          Default
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-800">{address.address}</p>
                      <p>
                        {address.city}, {address.state} {address.zip}
                      </p>
                      {address.country && (
                        <p className="text-xs text-gray-500 font-medium">{address.country}</p>
                      )}
                      {address.phone && (
                        <p className="text-xs text-gray-500">Phone: {address.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end items-center space-x-2 pt-3 border-t border-gray-100 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                      className="border-ushop-pink/30 text-ushop-purple-dark hover:bg-ushop_light_pink/50 rounded-lg text-xs"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1 text-ushop-pink" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => address._id && handleDeleteAddress(address._id)}
                      disabled={deletingAddressId === address._id}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs"
                    >
                      {deletingAddressId === address._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5 mr-1 text-red-500" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-ushop-pink/40 mx-auto mb-4" />
              <p className="text-gray-500 mb-4 font-medium">No shipping addresses found</p>
              <Button
                onClick={handleAddAddress}
                className="bg-ushop-pink hover:bg-ushop-magenta text-white font-semibold shadow-sm transition-all px-5 py-2.5 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Edit Sidebar */}
      {profileSidebarOpen && (
        <ProfileEditSidebar
          isOpen={profileSidebarOpen}
          onClose={() => setProfileSidebarOpen(false)}
          userData={userData}
        />
      )}

      {/* Address Edit Sidebar */}
      {addressSidebarOpen && (
        <AddressEditSidebar
          isOpen={addressSidebarOpen}
          onClose={() => setAddressSidebarOpen(false)}
          address={editingAddress}
          userId={clerk.id}
          onAddressChange={fetchAddresses}
        />
      )}
    </div>
  );
}
