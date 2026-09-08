"use client";

import React from "react";
import { CircleDot, Plus, Sparkles } from "lucide-react";

export function StoriesPane() {
  return (
    <div className="w-[310px] md:w-[330px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] flex flex-col h-full select-none p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Stories
        </h1>
        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="New Story (Coming Soon)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
        <div className="w-16 h-16 rounded-full bg-[var(--signal-ultramarine-pale)] text-[var(--signal-ultramarine)] flex items-center justify-center mb-4">
          <CircleDot className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
          Share your day
        </h3>

        <p className="text-xs text-[var(--text-muted)] max-w-xs mb-4 leading-relaxed">
          Stories disappear after 24 hours. Connect with your friends and share photos, video, and text.
        </p>

        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--signal-ultramarine)] font-semibold bg-[var(--signal-ultramarine-pale)] px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stories — Coming Soon</span>
        </span>
      </div>
    </div>
  );
}

