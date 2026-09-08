"use client";

import React, { useState } from "react";
import { X, Search, Check, ChevronLeft, Users } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { api, User } from "@/lib/api";
import { Avatar } from "../Avatar";
import { AVATAR_COLORS } from "@/lib/utils";

export function NewGroupModal() {
  const {
    isNewGroupOpen,
    setIsNewGroupOpen,
    contacts,
    loadConversations,
    setActiveConversationId,
  } = useAppStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[1]);
  const [isCreating, setIsCreating] = useState(false);

  if (!isNewGroupOpen) return null;

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    setIsCreating(true);
    try {
      const conv = await api.createGroup({
        name: groupName.trim(),
        member_ids: selectedUserIds,
      });
      await loadConversations();
      setActiveConversationId(conv.id);
      setIsNewGroupOpen(false);
      // Reset
      setStep(1);
      setSelectedUserIds([]);
      setGroupName("");
    } catch (err) {
      console.error("Failed to create group:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.display_name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        data-testid="new-group-modal"
        className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {step === 1 ? "Add members" : "Name this group"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsNewGroupOpen(false);
              setStep(1);
              setSelectedUserIds([]);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 ? (
          <>
            {/* Search Input */}
            <div className="p-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center bg-[var(--bg-primary)] rounded-xl px-3 py-2 border border-[var(--border-primary)] focus-within:border-[var(--signal-ultramarine)] transition-colors">
                <Search className="w-4 h-4 text-[var(--text-muted)] mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts"
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
                />
              </div>

              {/* Selected Pills */}
              {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1">
                  {selectedUserIds.map((id) => {
                    const c = contacts.find((u) => u.id === id);
                    if (!c) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded-full shrink-0 shadow-2xs"
                      >
                        <span>{c.display_name.split(" ")[0]}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleUser(id)}
                          className="hover:text-red-500 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredContacts.map((contact) => {
                const isSelected = selectedUserIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleToggleUser(contact.id)}
                    className="p-2.5 rounded-xl flex items-center gap-3 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                  >
                    <Avatar
                      name={contact.display_name}
                      color={contact.avatar_color}
                      initials={contact.initials}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {contact.display_name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate">
                        @{contact.username}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[var(--signal-ultramarine)] border-[var(--signal-ultramarine)] text-white"
                          : "border-[var(--border-secondary)]"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 1 Footer */}
            <div className="p-4 border-t border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <span className="text-xs text-[var(--text-muted)]">
                {selectedUserIds.length} member{selectedUserIds.length === 1 ? "" : "s"} selected
              </span>
              <button
                type="button"
                disabled={selectedUserIds.length === 0}
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-full bg-[var(--signal-ultramarine)] hover:bg-[var(--signal-ultramarine-hover)] disabled:opacity-50 text-white text-sm font-medium transition-all"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Name & Color */
          <div className="p-6 flex flex-col items-center">
            {/* Group Avatar Preview */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white mb-6 shadow-md transition-colors"
              style={{ backgroundColor: avatarColor }}
            >
              <Users className="w-9 h-9 text-[#121212]" />
            </div>

            {/* Color choices */}
            <div className="flex items-center gap-2 mb-6">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    avatarColor === c
                      ? "border-[var(--signal-ultramarine)] scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Group Name Input */}
            <div className="w-full mb-6">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Group name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                autoFocus
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-sm rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
              />
            </div>

            <button
              type="button"
              disabled={!groupName.trim() || isCreating}
              onClick={handleCreate}
              className="w-full py-2.5 rounded-full bg-[var(--signal-ultramarine)] hover:bg-[var(--signal-ultramarine-hover)] disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-xs"
            >
              {isCreating ? "Creating group..." : "Create Group"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

