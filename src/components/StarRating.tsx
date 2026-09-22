"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value?: number | null;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4.5 h-4.5",
  };

  const currentVal = hoverVal !== null ? hoverVal : value || 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentVal;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHoverVal(star)}
            onMouseLeave={() => !readonly && setHoverVal(null)}
            className={`transition-colors ${
              readonly
                ? "cursor-default"
                : "cursor-pointer hover:opacity-80"
            }`}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled
                  ? "text-black fill-black"
                  : "text-zinc-200 fill-zinc-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
