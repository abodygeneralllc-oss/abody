"use client";

import { useEffect, useRef, useState } from "react";

interface CoverImageProps {
  src: string;
  alt: string;
}

// A cover photo laid over the tinted placeholder art. If the image fails to
// load (a moved or private link), it removes itself so the art shows instead.
export function CoverImage({ src, alt }: CoverImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // An image that failed before hydration never fires onError again.
  useEffect(() => {
    const image = ref.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) return null;
  return (
    // Image hosts are not configured for next/image, so links can point at
    // any https host.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
