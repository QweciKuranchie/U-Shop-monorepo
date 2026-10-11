"use client";

import { upload } from "@imagekit/next";

export interface ClientUploadResult {
  fileId: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  filePath: string;
  width?: number;
  height?: number;
  size?: number;
}

/**
 * Browser-side upload straight to ImageKit using short-lived signed parameters from
 * the app's `/api/imagekit/auth` route. Imported via `@repo/media/src/uploadClient`
 * so client bundles never pull in the package's server-only code.
 */
export async function uploadToImageKit(
  file: File,
  opts: { folder?: string; authEndpoint?: string; onProgress?: (percent: number) => void } = {}
): Promise<ClientUploadResult> {
  const { folder = "/uploads", authEndpoint = "/api/imagekit/auth", onProgress } = opts;
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) throw new Error("Image uploads are not configured.");

  const authRes = await fetch(authEndpoint);
  if (!authRes.ok) throw new Error("Couldn't start the upload. Please sign in again.");
  const { token, signature, expire } = await authRes.json();

  const res = await upload({
    file,
    fileName: file.name,
    token,
    signature,
    expire,
    publicKey,
    folder,
    onProgress: (evt: ProgressEvent) => {
      if (evt.lengthComputable) onProgress?.(Math.round((evt.loaded / evt.total) * 100));
    },
  });
  return {
    fileId: res.fileId ?? "",
    url: res.url ?? "",
    thumbnailUrl: res.thumbnailUrl || res.url,
    name: res.name ?? file.name,
    filePath: res.filePath ?? "",
    width: res.width,
    height: res.height,
    size: res.size,
  };
}
