"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface ShortcutItem {
  description: string;
  keys: string[][]; // list of key combination alternatives, e.g. [["Ctrl", "F"]] or [["Alt", "↓"], ["Ctrl", "Tab"]]
}

interface ShortcutSection {
  title: string;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: "Navigation",
    shortcuts: [
      { description: "Focus search", keys: [["Ctrl", "F"]] },
      { description: "Next conversation", keys: [["Alt", "↓"], ["Ctrl", "Tab"]] },
      { description: "Previous conversation", keys: [["Alt", "↑"], ["Ctrl", "Shift", "Tab"]] },
      { description: "Jump to chat 1 to 9", keys: [["Ctrl", "1–9"]] },
      { description: "Close conversation", keys: [["Ctrl", "Shift", "C"], ["Esc"]] },
      { description: "Archive conversation", keys: [["Ctrl", "Shift", "A"]] },
      { description: "Mark as unread", keys: [["Ctrl", "Shift", "U"]] },
      { description: "Toggle navigation rail", keys: [["Ctrl", "B"]] },
    ],
  },
  {
    title: "Messages",
    shortcuts: [
      { description: "Search in conversation", keys: [["Ctrl", "Shift", "F"]] },
      { description: "Focus message composer", keys: [["Ctrl", "Shift", "T"]] },
      { description: "Reply to latest message", keys: [["Ctrl", "Shift", "R"]] },
      { description: "Scroll to top of chat", keys: [["Ctrl", "Home"]] },
      { description: "Scroll to bottom of chat", keys: [["Ctrl", "End"]] },
    ],
  },
  {
    title: "Composer",
    shortcuts: [
      { description: "Expand / shrink composer", keys: [["Ctrl", "Shift", "K"]] },
      { description: "Open emoji picker", keys: [["Ctrl", "Shift", "J"]] },
      { description: "Add new line", keys: [["Shift", "Enter"]] },
      { description: "Send message", keys: [["Enter"]] },
      { description: "Edit last message", keys: [["↑"]] },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { description: "Show keyboard shortcuts", keys: [["Ctrl", "/"]] },
      { description: "Preferences / Settings", keys: [["Ctrl", ","]] },
      { description: "New conversation", keys: [["Ctrl", "N"]] },
      { description: "New group", keys: [["Ctrl", "Shift", "N"]] },
    ],
  },
];

function KeyBadge({ text }: { text: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] px-2 py-0.5 rounded-md bg-[#38383b] text-[#f2f2f2] text-[12px] font-medium border border-white/10 shadow-xs select-none">
      {text}
    </kbd>
  );
}

export function KeyboardShortcutsModal() {
  const { isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen } = useAppStore();

  useEffect(() => {
    if (!isKeyboardShortcutsOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsKeyboardShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen]);

  if (!isKeyboardShortcutsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={() => setIsKeyboardShortcutsOpen(false)}
    >
      <div
        style={{ maxWidth: "560px", width: "100%" }}
        className="relative bg-[#242426] border border-[#38383a] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 select-none text-white max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="keyboard-shortcuts-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#38383a] shrink-0">
          <h2 className="text-[17px] font-bold text-white">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setIsKeyboardShortcutsOpen(false)}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-[#3c3c3e] hover:bg-[#4c4c4e] text-[#d1d1d1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-6">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8e8e93]">
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.shortcuts.map((sc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-[14px] text-white/90">
                      {sc.description}
                    </span>
                    <div className="flex items-center gap-2">
                      {sc.keys.map((combo, comboIdx) => (
                        <React.Fragment key={comboIdx}>
                          {comboIdx > 0 && (
                            <span className="text-xs text-[#8e8e93]">or</span>
                          )}
                          <div className="flex items-center gap-1">
                            {combo.map((k, kIdx) => (
                              <React.Fragment key={kIdx}>
                                {kIdx > 0 && (
                                  <span className="text-[11px] text-[#8e8e93]">+</span>
                                )}
                                <KeyBadge text={k} />
                              </React.Fragment>
                            ))}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

