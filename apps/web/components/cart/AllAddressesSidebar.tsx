"use client";

import React, { useState } from "react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
 } from "@repo/ui";
import {  RadioGroup, RadioGroupItem  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import {  Button  } from "@repo/ui";
import { MapPin, Check, Trash2, Loader2 } from "lucide-react";
import {  ScrollArea  } from "@repo/ui";
import { toast } from "sonner";

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface AllAddressesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddressDeleted?: () => void;
}

export function AllAddressesSidebar({
  isOpen,
  onClose,
  addresses,
  selectedAddress,
  onAddressSelect,
  onAddressDeleted,
}: AllAddressesSidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSelectAddress = (address: Address) => {
    onAddressSelect(address);
    onClose();
  };

  const handleDeleteAddress = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      setDeletingId(addressId);
      const res = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Address deleted");
        if (onAddressDeleted) {
          onAddressDeleted();
        } else {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete address");
      }
    } catch (err) {
      console.error("Delete address error:", err);
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg border-l border-ushop-pink/20">
        <SheetHeader className="pb-4 border-b border-ushop-pink/15">
          <SheetTitle className="flex items-center gap-2 text-ushop-purple-dark font-bold text-xl">
            <MapPin className="w-5 h-5 text-ushop-pink" />
            Select Shipping Address
          </SheetTitle>
          <SheetDescription className="text-gray-500 text-sm">
            Choose from {addresses.length} saved address
            {addresses.length !== 1 ? "es" : ""}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-4 pr-3">
          <RadioGroup
            value={selectedAddress?._id || ""}
            onValueChange={(value) => {
              const address = addresses.find((addr) => addr._id === value);
              if (address) handleSelectAddress(address);
            }}
            className="space-y-4"
          >
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`
                  relative border rounded-xl p-4 cursor-pointer transition-all bg-white
                  ${
                    selectedAddress?._id === address._id
                      ? "border-ushop-pink bg-ushop_light_pink/30 shadow-sm"
                      : "border-gray-200 hover:border-ushop-pink/40 hover:bg-ushop_light_pink/10"
                  }
                `}
                onClick={() => handleSelectAddress(address)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={address._id}
                    id={`address-${address._id}`}
                    className="mt-1 accent-ushop-purple text-ushop-purple"
                  />
                  <Label
                    htmlFor={`address-${address._id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-ushop-purple-dark text-base">
                          {address.name}
                        </div>
                        <div className="flex items-center gap-2">
                          {address.default && (
                            <span className="text-xs bg-ushop_light_pink text-ushop-pink border border-ushop-pink/30 px-2 py-0.5 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                          {selectedAddress?._id === address._id && (
                            <Check className="w-5 h-5 text-ushop-pink" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.address}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zip}
                      </div>
                      {address.email && (
                        <div className="text-xs text-gray-500">
                          {address.email}
                        </div>
                      )}
                    </div>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteAddress(e, address._id)}
                    disabled={deletingId === address._id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 h-auto rounded-lg ml-1"
                    title="Delete Address"
                  >
                    {deletingId === address._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
          <Button variant="outline" className="w-full rounded-xl border-ushop-pink/30 text-ushop-purple-dark hover:bg-ushop_light_pink/50 font-semibold" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
