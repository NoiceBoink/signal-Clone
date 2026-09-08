"use client";

import React, { useState } from "react";
import { X, FolderPlus } from "lucide-react";

interface AddChatFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
}

export function AddChatFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: AddChatFolderModalProps) {
  const [folderName, setFolderName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreateFolder(folderName.trim());
    setFolderName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#242424] border border-[#383838] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#333333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#323232] flex items-center justify-center text-white">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h2 className="text-[16px] font-semibold text-white">Add chat folder</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#333333] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
            Folder name
          </label>
          <input
            type="text"
            autoFocus
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g. Work, Family, Project"
            className="w-full bg-[#1c1c1c] border border-[#383838] focus:border-[#4c71e7] rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-[#666666] outline-hidden transition-colors"
          />

          <p className="text-xs text-[var(--text-muted)] mt-2">
            Organize chats into dedicated tabs in your sidebar.
          </p>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[#333333] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className="px-4 py-2 text-sm font-medium bg-[#4c71e7] hover:bg-[#3b5ec9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
