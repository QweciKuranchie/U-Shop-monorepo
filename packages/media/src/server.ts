import ImageKit from "@imagekit/nodejs";

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
}

export function getImageKitAuthParams(): ImageKitAuthParams {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "Missing ImageKit configuration environment variable (IMAGEKIT_PRIVATE_KEY)."
    );
  }

  const imagekit = new ImageKit({
    privateKey,
  });

  return imagekit.helper.getAuthenticationParameters();
}

export async function uploadFileToImageKit(
  fileBuffer: Buffer,
  fileName: string,
  folder: string,
  options: { isPrivate?: boolean } = {}
): Promise<string | null> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return null;
  }

  try {
    const imagekit = new ImageKit({
      privateKey,
    });

    const response = await imagekit.files.upload({
      file: fileBuffer.toString("base64"),
      fileName,
      folder,
      useUniqueFileName: true,
      // Private files are not served from the public CDN URL; they need a signed
      // URL. Required for identity documents.
      ...(options.isPrivate ? { isPrivateFile: true } : {}),
    });

    return response.url ?? null;
  } catch (error) {
    console.error("Failed to upload to ImageKit:", error);
    return null;
  }
}
