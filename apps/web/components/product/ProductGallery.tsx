"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@repo/ui";
import { buildProductGallery, type GalleryItem } from "@repo/sanity";

interface ProductGalleryProps {
  product: {
    name?: string | null;
    images?: unknown[] | null;
    video?: { url?: string | null; thumbnailUrl?: string | null } | null;
  };
}

/** Plays a product video: a hosted file, or a YouTube/Vimeo embed. */
function VideoPlayer({ item, className }: { item: Extract<GalleryItem, { type: "video" }>; className?: string }) {
  if (item.video.kind === "file") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        poster={item.poster ?? undefined}
        className={className}
        aria-label={item.alt}
      >
        <source src={item.video.url} />
        Your browser can&apos;t play this video.
      </video>
    );
  }
  return (
    <iframe
      src={item.video.embedUrl}
      title={item.alt}
      loading="lazy"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className={className}
    />
  );
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const items = buildProductGallery(product);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [zooming, setZooming] = useState(false);

  const count = items.length;
  const current = items[Math.min(active, Math.max(count - 1, 0))];
  const go = useCallback((dir: 1 | -1) => setActive((i) => (i + dir + count) % count), [count]);

  if (!current) {
    return (
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-ushop_light_bg border border-zinc-100">
        <Image src="/placeholder.svg" alt="No product image available" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-12" />
      </div>
    );
  }

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="space-y-4">
      {/* Main viewer */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-ushop_light_bg border border-zinc-100 shadow-xs">
        {current.type === "image" ? (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            onMouseEnter={() => setZooming(true)}
            onMouseLeave={() => setZooming(false)}
            onMouseMove={onMove}
            aria-label={`Open ${current.alt} full screen`}
            className="absolute inset-0 cursor-zoom-in overflow-hidden"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              preload={active === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-200 ease-out motion-reduce:transition-none"
              style={{ transform: zooming ? "scale(1.8)" : "scale(1)", transformOrigin: origin }}
            />
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/90 p-2 text-zinc-700 shadow-sm">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        ) : (
          <VideoPlayer item={current} className="absolute inset-0 h-full w-full bg-black" />
        )}

        {current.label && current.type === "image" && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            {current.label}
          </span>
        )}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails: every angle, lifestyle shot and the video */}
      {count > 1 && (
        <ul className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap" aria-label="Product media">
          {items.map((item, idx) => (
            <li key={item.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(idx)}
                aria-pressed={idx === active}
                aria-label={`Show ${item.label ?? `image ${idx + 1}`}`}
                className={`relative block h-16 w-16 overflow-hidden rounded-xl border-2 bg-ushop_light_bg sm:h-20 sm:w-20 ${
                  idx === active ? "border-ushop-pink shadow-xs" : "border-zinc-200/60 hover:border-zinc-300"
                }`}
              >
                {item.type === "image" ? (
                  <Image src={item.thumb} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-zinc-900 text-white">
                    <Play className="h-6 w-6" aria-hidden="true" />
                  </span>
                )}
                {item.label && (
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 text-xs leading-4 text-white">
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Full-screen viewer */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          className="h-[90vh] max-w-[min(96vw,1100px)] sm:max-w-[min(96vw,1100px)] bg-black p-2 text-white"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <DialogTitle className="sr-only">{current.alt}</DialogTitle>
          <DialogDescription className="sr-only">
            Image {Math.min(active, count - 1) + 1} of {count}. Use the arrow keys to browse.
          </DialogDescription>
          <div className="relative h-full w-full">
            {current.type === "image" ? (
              <Image src={current.src} alt={current.alt} fill sizes="96vw" className="object-contain" />
            ) : (
              <VideoPlayer item={current} className="h-full w-full" />
            )}
            {count > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs" aria-hidden="true">
                  {Math.min(active, count - 1) + 1} / {count}
                </span>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
