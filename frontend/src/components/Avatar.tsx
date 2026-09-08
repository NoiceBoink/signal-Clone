"use client";

import React from "react";
import { Users } from "lucide-react";
import { getInitials, getAvatarTextColor } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color?: string | null;
  initials?: string;
  avatarUrl?: string | null;
  isGroup?: boolean;
  isOnline?: boolean;
  size?: "xs" | "author" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[11px]",
  author: "w-7 h-7 text-[12px]",
  sm: "w-8 h-8 text-[14px]",
  md: "w-12 h-12 text-[21px]",
  lg: "w-14 h-14 text-[25px]",
  xl: "w-[72px] h-[72px] text-[32px]",
};

const onlineDotSizes = {
  xs: "w-1.5 h-1.5 border-[1px]",
  author: "w-2 h-2 border-[1.5px]",
  sm: "w-2.5 h-2.5 border-[1.5px]",
  md: "w-3 h-3 border-2",
  lg: "w-3.5 h-3.5 border-2",
  xl: "w-4 h-4 border-2",
};

export function Avatar({
  name,
  color,
  initials,
  avatarUrl,
  isGroup = false,
  isOnline = false,
  size = "md",
  className = "",
}: AvatarProps) {
  const bgColor = color || (isGroup ? "#c9d5ed" : "#edd0c9");
  const displayInitials = initials || getInitials(name);
  const textColor = getAvatarTextColor(bgColor);

  const imgUrl =
    avatarUrl ||
    (name?.toLowerCase().includes("pratham") ? "/pratham_avatar.png" : null);

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-normal select-none shadow-xs transition-transform tracking-tight overflow-hidden`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={name}
            className="w-full h-full object-cover rounded-full pointer-events-none"
          />
        ) : isGroup ? (
          <Users
            className={
              size === "xs" || size === "author" || size === "sm"
                ? "w-3.5 h-3.5"
                : "w-5 h-5"
            }
          />
        ) : (
          <span className="leading-none select-none">{displayInitials}</span>
        )}
      </div>

      {isOnline && !isGroup && (
        <span
          className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} bg-emerald-500 rounded-full border-[var(--bg-secondary)]`}
          title="Online"
        />
      )}
    </div>
  );
}

