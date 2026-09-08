"use client";

import React, { useState } from "react";
import { X, UserPlus, Trash2, LogOut, ShieldAlert, Edit2, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { api, User } from "@/lib/api";
import { Avatar } from "../Avatar";

export function GroupDetailsModal() {
  const { user } = useAuth();
  const {
    activeConversation,
    isGroupDetailsOpen,
    setIsGroupDetailsOpen,
    contacts,
    loadConversations,
    setActiveConversationId,
  } = useAppStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isGroupDetailsOpen || !activeConversation || !activeConversation.is_group) {
    return null;
  }

  const currentMember = activeConversation.members?.find((m) => m.id === user?.id);
  const isAdmin = currentMember?.is_admin || activeConversation.created_by === user?.id;

  const handleUpdateName = async () => {
    if (!editedName.trim()) return;
    setIsLoading(true);
    try {
      await api.updateGroup(activeConversation.id, { name: editedName.trim() });
      await loadConversations();
      setIsEditingName(false);
    } catch (err) {
      console.error("Update group name error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    try {
      await api.addGroupMember(activeConversation.id, selectedUserId);
      await loadConversations();
      setShowAddMember(false);
      setSelectedUserId("");
    } catch (err) {
      console.error("Add member error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setIsLoading(true);
    try {
      await api.removeGroupMember(activeConversation.id, memberId);
      await loadConversations();
    } catch (err) {
      console.error("Remove member error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !confirm("Are you sure you want to leave this group?")) return;
    setIsLoading(true);
    try {
      await api.removeGroupMember(activeConversation.id, user.id);
      await loadConversations();
      setIsGroupDetailsOpen(false);
      setActiveConversationId(null);
    } catch (err) {
      console.error("Leave group error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Contacts who are not yet members
  const nonMemberContacts = contacts.filter(
    (c) => !activeConversation.members?.some((m) => m.id === c.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between select-none">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Group Info
          </h2>
          <button
            type="button"
            onClick={() => setIsGroupDetailsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Hero */}
        <div className="p-6 flex flex-col items-center border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] select-none">
          <Avatar
            name={activeConversation.group_name || "Group"}
            color={activeConversation.group_avatar_color}
            isGroup
            size="xl"
            className="mb-3"
          />

          {isEditingName ? (
            <div className="flex items-center gap-2 w-full max-w-xs">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                autoFocus
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--signal-ultramarine)] text-sm rounded-lg px-3 py-1.5 text-[var(--text-primary)] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleUpdateName}
                className="p-1.5 bg-[var(--signal-ultramarine)] text-white rounded-lg hover:bg-[var(--signal-ultramarine-hover)]"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)] text-center">
                {activeConversation.group_name}
              </h3>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedName(activeConversation.group_name || "");
                    setIsEditingName(true);
                  }}
                  title="Edit Group Name"
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <span className="text-xs text-[var(--text-muted)] mt-1">
            {activeConversation.members?.length || 0} members
          </span>
        </div>

        {/* Member Management */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add member button for Admins */}
          {isAdmin && (
            <div>
              {!showAddMember ? (
                <button
                  type="button"
                  onClick={() => setShowAddMember(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[var(--border-secondary)] hover:border-[var(--signal-ultramarine)] text-xs font-semibold text-[var(--signal-ultramarine)] flex items-center justify-center gap-2 hover:bg-[var(--signal-ultramarine-pale)] transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Members</span>
                </button>
              ) : (
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
                  <div className="text-xs font-semibold mb-2 text-[var(--text-primary)]">
                    Select Contact to Add
                  </div>
                  {nonMemberContacts.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)]"
                      >
                        <option value="">-- Choose a contact --</option>
                        {nonMemberContacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.display_name} (@{c.username})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!selectedUserId || isLoading}
                          onClick={handleAddMember}
                          className="flex-1 py-1.5 bg-[var(--signal-ultramarine)] text-white text-xs font-medium rounded-lg hover:bg-[var(--signal-ultramarine-hover)] disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddMember(false)}
                          className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-muted)]">
                      All your contacts are already in this group!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Members
            </div>

            <div className="space-y-1">
              {activeConversation.members?.map((member) => (
                <div
                  key={member.id}
                  className="p-2.5 rounded-xl flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={member.display_name}
                      color={member.avatar_color}
                      initials={member.initials}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                        <span>{member.display_name}</span>
                        {member.id === user?.id && (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate">
                        @{member.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.is_admin && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--signal-ultramarine)] bg-[var(--signal-ultramarine-pale)] px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}

                    {isAdmin && member.id !== user?.id && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove member"
                        className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Leave Group */}
        <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <button
            type="button"
            onClick={handleLeaveGroup}
            className="w-full py-2 rounded-xl text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Group</span>
          </button>
        </div>
      </div>
    </div>
  );
}

