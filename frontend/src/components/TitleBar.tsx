"use client";

import React from "react";
import Image from "next/image";
import { Minus, Square, X } from "lucide-react";

export function TitleBar() {
  return (
    <header className="h-8 select-none flex items-center justify-between px-3 text-xs bg-[var(--titlebar-bg)] border-b border-[var(--border-primary)] z-50">
      <div className="flex items-center gap-2">
        <div className="relative w-4 h-4">
          <Image
            src="/signal-logo.svg"
            alt="Signal Logo"
            width={16}
            height={16}
            className="object-contain"
          />
        </div>
        <span className="font-medium text-[var(--text-secondary)] text-[11px] tracking-wide">
          Signal
        </span>
      </div>

      {/* Mocked Window Controls */}
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Minimize"
          className="w-8 h-6 flex items-center justify-center hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          type="button"
          aria-label="Maximize"
          className="w-8 h-6 flex items-center justify-center hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button
          type="button"
          aria-label="Close"
          className="w-8 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white text-[var(--text-muted)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

