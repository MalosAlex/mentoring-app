"use client";

import Image from "next/image";
import { isVideoUrl } from "@/lib/helper";

interface PostMediaProps {
  src: string;
  alt: string;
  className?: string;
}

export function PostMedia({ src, alt, className = "" }: PostMediaProps) {
  if (isVideoUrl(src)) {
    return (
      <video
        controls
        className={`w-full h-full object-cover ${className}`}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      unoptimized
    />
  );
}