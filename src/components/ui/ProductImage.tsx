"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps extends Omit<ImageProps, "onError"> {
  iconClassName?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className,
  iconClassName,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-muted text-secondary",
          className
        )}
      >
        <Package className={cn("w-5 h-5", iconClassName)} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Product image"}
      className={className}
      unoptimized
      onError={() => setError(true)}
      {...props}
    />
  );
};
