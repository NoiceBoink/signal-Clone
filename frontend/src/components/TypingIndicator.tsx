"use client";

import React from "react";

interface TypingIndicatorProps {
  senderName?: string;
}

export function TypingIndicator({ senderName }: TypingIndicatorProps) {
  return (
    <div className="group relative flex flex-col px-4 my-[2px] items-start animate-in fade-in duration-150 select-none">
      {senderName && (
        <span className="text-[11px] font-semibold text-[var(--signal-ultramarine)] mb-1 ml-1">
          {senderName}
        </span>
      )}
      <div className="relative flex items-center">
        <div
          className="inline-flex items-center justify-center bg-[var(--bubble-incoming)] rounded-[18px] h-[34px] px-4 shadow-2xs"
          style={{ minWidth: "52px" }}
        >
          <div className="flex items-center gap-[5px]">
            <div className="w-[6.5px] h-[6.5px] rounded-full bg-neutral-600 dark:bg-white animate-signal-dot-1" />
            <div className="w-[6.5px] h-[6.5px] rounded-full bg-neutral-600 dark:bg-white animate-signal-dot-2" />
            <div className="w-[6.5px] h-[6.5px] rounded-full bg-neutral-600 dark:bg-white animate-signal-dot-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

