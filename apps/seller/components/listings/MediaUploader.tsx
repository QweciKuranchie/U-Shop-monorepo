"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";
import { Button, Input, Label } from "@repo/ui";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_ROLES,
  parseProductVideo,
  productImageUrl,
} from "@repo/sanity";
import { uploadToImageKit } from "@repo/media/src/uploadClient";

export interface MediaImage {
  _key: string;
  _type: "image" | "imagekitAsset";
  url?: string;
  thumbnailUrl?: string;
  fileId?: string;
  filePath?: string;
  asset?: { _ref: string };
  role?: string;
  alt?: string;
}
export interface MediaVideo {
  url: string;
  thumbnailUrl?: string;
  fileId?: string;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const key = () => Math.random().toString(36).slice(2, 12);

interface Props {
  images: MediaImage[];
  onImagesChange: (images: MediaImage[]) => void;
  video: MediaVideo | null;
  onVideoChange: (video: MediaVideo | null) => void;
}

export function MediaUploader({ images, onImagesChange, video, onVideoChange }: Props) {
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "image" | "video">(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = MAX_PRODUCT_IMAGES - images.length;
    const picked = Array.from(files).slice(0, room);
    const next = [...images];
    setBusy("image");
    try {
      for (const file of picked) {
        if (!/^image\/(png|jpe?g|webp|avif)$/.test(file.type)) throw new Error(`${file.name}: use PNG, JPEG, WebP or AVIF`);
        if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} is over 10MB`);
        setProgress(0);
        const r = await uploadToImageKit(file, { folder: "/products", onProgress: setProgress });
        next.push({
          _key: key(),
          _type: "imagekitAsset",
          url: r.url,
          thumbnailUrl: r.thumbnailUrl,
          fileId: r.fileId,
          filePath: r.filePath,
          // First photo defaults to "front", the rest are left for the seller to label.
          role: next.length === 0 ? "front" : undefined,
        });
        onImagesChange([...next]);
      }
      if (files.length > room) setError(`Only ${MAX_PRODUCT_IMAGES} photos are allowed; extra files were skipped.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      if (imageInput.current) imageInput.current.value = "";
    }
  };

  const addVideoFile = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!/^video\/(mp4|webm|quicktime)$/.test(file.type)) return setError("Use an MP4, WebM or MOV video");
    if (file.size > MAX_VIDEO_BYTES) return setError("Video must be 25MB or smaller. Trim it or paste a YouTube link instead.");
    setBusy("video");
    setProgress(0);
    try {
      const r = await uploadToImageKit(file, { folder: "/product-videos", onProgress: setProgress });
      onVideoChange({ url: r.url, fileId: r.fileId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      if (videoInput.current) videoInput.current.value = "";
    }
  };

  const setVideoFromLink = () => {
    setError("");
    if (!parseProductVideo(videoLink.trim())) return setError("Paste an https YouTube or Vimeo link");
    onVideoChange({ url: videoLink.trim() });
    setVideoLink("");
  };

  const update = (i: number, patch: Partial<MediaImage>) =>
    onImagesChange(images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const copy = [...images];
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    onImagesChange(copy);
  };

  const hasLifestyle = images.some((i) => i.role === "lifestyle");

  return (
    <fieldset className="space-y-4 rounded-md border p-4">
      <legend className="px-1 text-sm font-medium">Photos & video</legend>
      <p className="text-xs text-muted-foreground">
        Add up to {MAX_PRODUCT_IMAGES} photos. The first is your main photo. Buyers trust listings with several angles
        (front, back, sides, close-ups) and at least one lifestyle shot of the product in use.
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <li key={img._key} className="space-y-2 rounded-md border p-2">
            <div className="relative aspect-square overflow-hidden rounded bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImageUrl(img, { width: 300 }) ?? ""} alt={img.alt || `Photo ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-[10px] text-white">Main</span>}
            </div>
            <select
              aria-label={`What photo ${i + 1} shows`}
              value={img.role ?? ""}
              onChange={(e) => update(i, { role: e.target.value || undefined })}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="">Photo type…</option>
              {PRODUCT_IMAGE_ROLES.map((r) => <option key={r.value} value={r.value}>{r.title}</option>)}
            </select>
            <Input
              aria-label={`Description of photo ${i + 1}`}
              placeholder="Short description (optional)"
              maxLength={120}
              value={img.alt ?? ""}
              onChange={(e) => update(i, { alt: e.target.value || undefined })}
              className="h-8 text-xs"
            />
            <div className="flex justify-between">
              <Button type="button" size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier"><ArrowLeft className="h-4 w-4" /></Button>
              <Button type="button" size="icon" variant="ghost" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Move later"><ArrowRight className="h-4 w-4" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => onImagesChange(images.filter((_, idx) => idx !== i))} aria-label="Remove photo"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </li>
        ))}
        {images.length < MAX_PRODUCT_IMAGES && (
          <li>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => imageInput.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed text-xs text-muted-foreground hover:border-primary disabled:opacity-50"
            >
              {busy === "image" ? <><Loader2 className="h-5 w-5 animate-spin" />{progress}%</> : <><Plus className="h-5 w-5" />Add photos</>}
            </button>
          </li>
        )}
      </ul>
      <input ref={imageInput} type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={(e) => addImages(e.target.files)} />

      {images.length > 0 && images.length < 3 && (
        <p className="text-xs text-amber-700">Tip: listings with 3 or more photos sell better.</p>
      )}
      {images.length > 0 && !hasLifestyle && (
        <p className="text-xs text-amber-700">Tip: add a lifestyle photo (the product in use) and mark its type.</p>
      )}

      <div className="space-y-2 border-t pt-3">
        <Label className="text-sm">Product video (optional)</Label>
        {video ? (
          <div className="flex items-center justify-between gap-3 rounded-md border p-2 text-xs">
            <span className="truncate">{video.url}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => onVideoChange(null)}>Remove</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input aria-label="YouTube or Vimeo link" placeholder="Paste a YouTube or Vimeo link" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} className="h-9 text-xs" />
              <Button type="button" size="sm" variant="outline" onClick={setVideoFromLink} disabled={!videoLink.trim()}>Add link</Button>
            </div>
            <Button type="button" size="sm" variant="outline" disabled={busy !== null} onClick={() => videoInput.current?.click()}>
              {busy === "video" ? `Uploading… ${progress}%` : "Or upload a video (MP4/WebM, up to 25MB)"}
            </Button>
            <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => addVideoFile(e.target.files?.[0])} />
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}
