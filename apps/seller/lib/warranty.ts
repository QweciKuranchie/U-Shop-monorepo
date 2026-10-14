export const WARRANTY_TYPES = ["no_warranty", "seller_warranty", "manufacturer_warranty"] as const;
export type WarrantyType = (typeof WARRANTY_TYPES)[number];

export interface WarrantyFields {
  warrantyType: WarrantyType;
  warrantyDuration?: number;
  warrantyDescription?: string;
  freeTechSupport: boolean;
}

/**
 * Validates the warranty block of a listing payload (mirrors the Studio rules:
 * duration >= 1 month when a warranty is offered, description <= 500 chars).
 * Returns the fields to store, or an error message.
 */
export function parseWarranty(body: Record<string, unknown>): { data: WarrantyFields } | { error: string } {
  const type = (body.warrantyType ?? "no_warranty") as string;
  if (!WARRANTY_TYPES.includes(type as WarrantyType)) return { error: "Invalid warranty type" };
  const freeTechSupport = body.freeTechSupport === true;
  if (type === "no_warranty") return { data: { warrantyType: "no_warranty", freeTechSupport } };

  const months = Number(body.warrantyDuration);
  if (!Number.isInteger(months) || months < 1 || months > 120)
    return { error: "Warranty duration must be a whole number of months between 1 and 120" };
  const description = typeof body.warrantyDescription === "string" ? body.warrantyDescription.trim() : "";
  if (description.length > 500) return { error: "Warranty description must be 500 characters or fewer" };
  return {
    data: {
      warrantyType: type as WarrantyType,
      warrantyDuration: months,
      ...(description ? { warrantyDescription: description } : {}),
      freeTechSupport,
    },
  };
}
