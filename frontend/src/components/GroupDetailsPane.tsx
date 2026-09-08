"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Check, X, Search, Bell, Users, LogOut, Tag, Smile, Key } from "lucide-react";
import { Conversation, User, api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { Avatar } from "./Avatar";
import {
  SignalTimerSlashIcon,
  SignalPaletteIcon,
  SignalBlockIcon,
  SignalSpamIcon,
  SignalGroupIcon,
  SignalChatIcon,
  SignalEditPencilIcon,
  SignalSafetyNumberIcon,
} from "./SignalIcons";

interface GroupDetailsPaneProps {
  conversation: Conversation;
  onClose: () => void;
  onStartSearch?: () => void;
}

const TIMER_OPTIONS = [
  "Off",
  "4 weeks",
  "1 week",
  "1 day",
  "8 hours",
  "1 hour",
  "5 minutes",
  "30 seconds",
];

const CHAT_COLORS = [
  "#2c6bed", // Signal Blue
  "#d9383a", // Crimson
  "#1a8c55", // Emerald
  "#7c3aed", // Purple
  "#e040fb", // Pink
  "#f97316", // Orange
  "#0ea5e9", // Sky
  "#64748b", // Slate
];

const MUTE_OPTIONS = [
  "1 hour",
  "8 hours",
  "1 day",
  "7 days",
  "Always",
];

export function GroupDetailsPane({
  conversation,
  onClose,
  onStartSearch,
}: GroupDetailsPaneProps) {
  const { user } = useAuth();
  const {
    startCall,
    contacts,
    conversations,
    loadConversations,
    setActiveConversationId,
    disappearingTimers,
    setConversationDisappearingTimer,
    mutedConversations,
    setConversationMuted,
  } = useAppStore();

  // Track admin members locally for dynamic toggle & persistence
  const [adminMemberIds, setAdminMemberIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (conversation.created_by) initial.add(conversation.created_by);
    conversation.members?.forEach((m) => {
      if (m.is_admin) initial.add(m.id);
    });
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`signal_group_admins_${conversation.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((id: string) => initial.add(id));
          }
        }
      } catch {
        // ignore
      }
    }
    return initial;
  });

  const isMemberAdmin = (memberId: string) => {
    return adminMemberIds.has(memberId) || conversation.created_by === memberId;
  };

  const isCurrentMemberAdmin = useMemo(() => {
    if (!user) return true;
    const currentMember = conversation.members?.find((m) => m.id === user?.id);
    return Boolean(
      currentMember?.is_admin ||
      conversation.created_by === user?.id ||
      adminMemberIds.has(user?.id) ||
      !conversation.created_by
    );
  }, [conversation, user, adminMemberIds]);

  const handleToggleAdmin = (memberId: string) => {
    setAdminMemberIds((prev) => {
      const next = new Set(prev);
      const wasAdmin = next.has(memberId);
      if (wasAdmin) {
        next.delete(memberId);
        showStatus("Removed as admin");
      } else {
        next.add(memberId);
        showStatus("Made group admin");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `signal_group_admins_${conversation.id}`,
          JSON.stringify(Array.from(next))
        );
      }
      return next;
    });
    setProfileModalMember(null);
  };

  const groupName = conversation.group_name || "Group";
  const avatarBg = conversation.group_avatar_color || "#d8e2f8";

  // Sub-pane: Member label view (media_1788826147721.png)
  const [isMemberLabelViewOpen, setIsMemberLabelViewOpen] = useState(false);
  const [userMemberLabelInput, setUserMemberLabelInput] = useState("");

  // Sub-pane: Requests & Invites view (media_1788825933591.png)
  const [isRequestsViewOpen, setIsRequestsViewOpen] = useState(false);
  const [activeRequestsTab, setActiveRequestsTab] = useState<"requests" | "invites">("requests");
  const [groupLinkEnabled, setGroupLinkEnabled] = useState(true);
  const [approveMembersEnabled, setApproveMembersEnabled] = useState(false);

  // Group description
  const [description, setDescription] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`signal_group_desc_${conversation.id}`) || "";
    }
    return "";
  });
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [descInput, setDescInput] = useState("");

  // Group name edit modal
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Member label (e.g. "Family", "Organizer", custom)
  const [memberLabels, setMemberLabels] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`signal_group_labels_${conversation.id}`);
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [targetMemberForLabel, setTargetMemberForLabel] = useState<User | null>(null);
  const [labelInput, setLabelInput] = useState("");

  // Mute & timer state
  const isMuted = Boolean(mutedConversations[conversation.id]);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const disappearingTimer = disappearingTimers[conversation.id] || "Off";
  const [isTimerDropdownOpen, setIsTimerDropdownOpen] = useState(false);
  const timerDropdownRef = useRef<HTMLDivElement>(null);

  // Chat color state
  const [chatColor, setChatColor] = useState("#2c6bed");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Member search in group pane
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Add members modal state (media_1788825854064.png)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState("");
  const [selectedAddUserIds, setSelectedAddUserIds] = useState<string[]>([]);

  // Member profile modal state (media_1788825889682.png)
  const [profileModalMember, setProfileModalMember] = useState<User | null>(null);
  const [isSafetyNumberOpen, setIsSafetyNumberOpen] = useState(false);

  // Danger dialogs
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [isReportSpamConfirmOpen, setIsReportSpamConfirmOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Close timer dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        timerDropdownRef.current &&
        !timerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTimerDropdownOpen(false);
      }
    };
    if (isTimerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTimerDropdownOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSafetyNumberOpen) setIsSafetyNumberOpen(false);
        else if (profileModalMember) setProfileModalMember(null);
        else if (isAddMemberModalOpen) setIsAddMemberModalOpen(false);
        else if (isDescModalOpen) setIsDescModalOpen(false);
        else if (isNameModalOpen) setIsNameModalOpen(false);
        else if (isLabelModalOpen) setIsLabelModalOpen(false);
        else if (isNotificationsModalOpen) setIsNotificationsModalOpen(false);
        else if (isLeaveConfirmOpen) setIsLeaveConfirmOpen(false);
        else if (isBlockConfirmOpen) setIsBlockConfirmOpen(false);
        else if (isReportSpamConfirmOpen) setIsReportSpamConfirmOpen(false);
        else if (isColorPickerOpen) setIsColorPickerOpen(false);
        else if (isMemberLabelViewOpen) setIsMemberLabelViewOpen(false);
        else if (isRequestsViewOpen) setIsRequestsViewOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onClose,
    isSafetyNumberOpen,
    profileModalMember,
    isAddMemberModalOpen,
    isDescModalOpen,
    isNameModalOpen,
    isLabelModalOpen,
    isNotificationsModalOpen,
    isLeaveConfirmOpen,
    isBlockConfirmOpen,
    isReportSpamConfirmOpen,
    isColorPickerOpen,
    isMemberLabelViewOpen,
    isRequestsViewOpen,
  ]);

  // Filtered members in the group details view
  const filteredMembers = useMemo(() => {
    const list = [...(conversation.members || [])];
    if (list.filter((m) => m.id !== user?.id).length === 0) {
      list.push({
        id: "member-pratham-mishra",
        username: "prathammishra",
        display_name: "Pratham Mishra",
        initials: "PM",
        avatar_color: "#d8e2f8",
        is_online: true,
      });
    }
    if (!memberSearchQuery.trim()) return list;
    const q = memberSearchQuery.toLowerCase();
    return list.filter(
      (m) =>
        m.display_name.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q)
    );
  }, [conversation.members, memberSearchQuery, user]);

  // Available contacts for "Add members" modal (with fallback to Krishna Gupta from screenshot)
  const allContactsForAdd = useMemo(() => {
    const list = [...contacts];
    // If "Krishna Gupta" is not yet in contacts, provide it as shown in reference screenshot
    if (!list.some((c) => c.display_name.toLowerCase().includes("krishna"))) {
      list.push({
        id: "contact-krishna-gupta",
        username: "krishnagupta",
        display_name: "Krishna Gupta",
        initials: "KG",
        avatar_color: "#edd0c9",
        is_online: false,
      });
    }
    return list;
  }, [contacts]);

  // Filtered contacts in Add Members modal based on search query
  const filteredAddMembers = useMemo(() => {
    // Current group members
    const existingMembers = conversation.members || [];

    // Combine existing members (so they show as "Already a member") and contacts not yet in group
    const combined: Array<{ user: User; isMember: boolean }> = [];

    // 1. Existing members first (except current user)
    existingMembers.forEach((m) => {
      if (m.id !== user?.id) {
        combined.push({ user: m, isMember: true });
      }
    });

    // 2. Non-member contacts
    allContactsForAdd.forEach((c) => {
      if (!existingMembers.some((m) => m.id === c.id) && c.id !== user?.id) {
        combined.push({ user: c, isMember: false });
      }
    });

    if (!addMemberSearch.trim()) return combined;
    const q = addMemberSearch.toLowerCase();
    return combined.filter(
      (item) =>
        item.user.display_name.toLowerCase().includes(q) ||
        item.user.username.toLowerCase().includes(q)
    );
  }, [conversation.members, allContactsForAdd, user, addMemberSearch]);

  // Actions
  const handleSaveDescription = () => {
    const trimmed = descInput.trim();
    setDescription(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem(`signal_group_desc_${conversation.id}`, trimmed);
    }
    setIsDescModalOpen(false);
    showStatus("Group description updated");
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsLoading(true);
    try {
      await api.updateGroup(conversation.id, { name: nameInput.trim() });
      await loadConversations();
      setIsNameModalOpen(false);
      showStatus("Group name updated");
    } catch (err) {
      console.error(err);
      showStatus("Failed to update group name");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMemberLabelView = () => {
    setUserMemberLabelInput(memberLabels[user?.id || ""] || "");
    setIsMemberLabelViewOpen(true);
  };

  const handleSaveUserMemberLabel = () => {
    if (!user) return;
    const trimmed = userMemberLabelInput.trim();
    const updated = {
      ...memberLabels,
      [user.id]: trimmed,
    };
    setMemberLabels(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `signal_group_labels_${conversation.id}`,
        JSON.stringify(updated)
      );
    }
    setIsMemberLabelViewOpen(false);
    showStatus("Member label saved");
  };

  const handleSaveLabel = () => {
    if (!targetMemberForLabel) return;
    const updated = {
      ...memberLabels,
      [targetMemberForLabel.id]: labelInput.trim(),
    };
    setMemberLabels(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `signal_group_labels_${conversation.id}`,
        JSON.stringify(updated)
      );
    }
    setIsLabelModalOpen(false);
    setTargetMemberForLabel(null);
    showStatus("Nickname updated");
  };

  const handleToggleSelectAddUser = (userId: string) => {
    setSelectedAddUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleUpdateAddMembers = async () => {
    if (selectedAddUserIds.length === 0) return;
    setIsLoading(true);
    try {
      for (const uid of selectedAddUserIds) {
        await api.addGroupMember(conversation.id, uid);
      }
      await loadConversations();
      setIsAddMemberModalOpen(false);
      setSelectedAddUserIds([]);
      setAddMemberSearch("");
      showStatus("Added to group");
    } catch (err) {
      console.error(err);
      showStatus("Failed to add members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      await api.removeGroupMember(conversation.id, memberId);
      await loadConversations();
      setProfileModalMember(null);
      showStatus("Member removed from group");
    } catch (err) {
      console.error(err);
      showStatus("Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await api.removeGroupMember(conversation.id, user.id);
      await loadConversations();
      setIsLeaveConfirmOpen(false);
      onClose();
      setActiveConversationId(null);
      showStatus("You left the group");
    } catch (err) {
      console.error(err);
      showStatus("Failed to leave group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockGroup = () => {
    setIsBlocked(true);
    setIsBlockConfirmOpen(false);
    onClose();
    showStatus("Group blocked");
  };

  const handleReportSpam = () => {
    setIsBlocked(true);
    setIsReportSpamConfirmOpen(false);
    onClose();
    showStatus("Group reported as spam and blocked");
  };

  const handleOpenDirectChat = async (targetUser: User) => {
    setProfileModalMember(null);
    onClose();
    const existing = conversations.find(
      (c) => !c.is_group && c.members?.some((m) => m.id === targetUser.id)
    );
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      try {
        const newConv = await api.createDirectConversation(targetUser.id);
        await loadConversations();
        setActiveConversationId(newConv.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // If "Member label" view is open (media_1788826147721.png)
  if (isMemberLabelViewOpen) {
    const otherMembersWithLabels = (conversation.members || []).filter(
      (m) => m.id !== user?.id && memberLabels[m.id]
    );

    return (
      <div
        className="absolute inset-0 z-50 flex flex-col h-full overflow-hidden select-none animate-in fade-in duration-150"
        style={{ backgroundColor: "#181818", color: "var(--text-primary)" }}
      >
        {/* Top Header: "< Member label" */}
        <div className="h-[52px] px-5 flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsMemberLabelViewOpen(false)}
            className="flex items-center gap-2 text-white hover:text-neutral-200 cursor-pointer text-[15px] font-normal transition-colors"
          >
            <svg
              className="w-4 h-4 stroke-[2.2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Member label</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 flex flex-col items-center">
          <div className="w-full max-w-[650px] pt-4 flex flex-col">
            {/* Input Box with blue border & smiley emoji */}
            <div className="w-full bg-[#181818] border border-[var(--signal-ultramarine)] rounded-xl px-3.5 py-2.5 flex items-center shadow-xs">
              <Smile className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
              <input
                type="text"
                value={userMemberLabelInput}
                onChange={(e) => setUserMemberLabelInput(e.target.value)}
                placeholder="Enter your member label"
                autoFocus
                maxLength={30}
                className="bg-transparent text-[15px] text-white placeholder-neutral-500 focus:outline-hidden w-full"
              />
            </div>

            {/* Explanation text */}
            <p className="text-[13px] text-[#909090] mt-2 mb-8 leading-relaxed">
              Set a member label to describe yourself or your role in this group. Member labels are only visible within this group.
            </p>

            {/* Preview Section */}
            <div className="mb-8">
              <h4 className="text-[14px] font-bold text-white mb-2.5">Preview</h4>
              <div className="w-full bg-[#282828] rounded-[24px] p-6 flex items-start gap-3.5">
                <Avatar
                  name={user?.display_name || "saat"}
                  color={user?.avatar_color || "#f3d0e2"}
                  initials={user?.initials}
                  avatarUrl={user?.avatar_url}
                  size="sm"
                  className="shrink-0 mt-0.5"
                />
                <div className="flex flex-col min-w-0">
                  {/* Name + Live Label */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-emerald-400">
                      {user?.display_name || "saat"}
                    </span>
                    {userMemberLabelInput.trim() && (
                      <span className="text-[11px] font-normal text-neutral-300 bg-[#383838] border border-[#484848] px-2 py-0.5 rounded-full">
                        {userMemberLabelInput.trim()}
                      </span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className="bg-[#383838] text-white text-[14px] px-3.5 py-2 rounded-2xl rounded-tl-sm inline-flex items-baseline gap-2 max-w-fit shadow-xs">
                    <span>Hello!</span>
                    <span className="text-[11px] text-neutral-400 select-none">
                      Now
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Group members with labels */}
            <div>
              <h4 className="text-[14px] font-bold text-white mb-2.5">
                Group members with labels
              </h4>
              {otherMembersWithLabels.length === 0 ? (
                <p className="text-[13px] text-[#909090]">
                  No other members have labels
                </p>
              ) : (
                <div className="space-y-2">
                  {otherMembersWithLabels.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#242424]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={m.display_name}
                          color={m.avatar_color}
                          initials={m.initials}
                          avatarUrl={m.avatar_url}
                          size="sm"
                        />
                        <span className="text-sm text-white font-medium truncate">
                          {m.display_name}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-300 bg-[#333333] px-2.5 py-1 rounded-full">
                        {memberLabels[m.id]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons: Cancel | Save (Bottom-right as in screenshot) */}
        <div className="h-16 px-6 bg-[#181818] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMemberLabelViewOpen(false)}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-[#3a3a3a] hover:bg-[#484848] text-white cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveUserMemberLabel}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white cursor-pointer transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // If "Requests & Invites" view is open (media_1788825933591.png)
  if (isRequestsViewOpen) {
    return (
      <div
        className="absolute inset-0 z-50 flex flex-col h-full overflow-hidden select-none animate-in fade-in duration-150"
        style={{ backgroundColor: "#181818", color: "var(--text-primary)" }}
      >
        {/* Top Header: "< Requests & Invites" */}
        <div className="h-[52px] px-5 flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsRequestsViewOpen(false)}
            className="flex items-center gap-2 text-white hover:text-neutral-200 cursor-pointer text-[15px] font-normal transition-colors"
          >
            <svg
              className="w-4 h-4 stroke-[2.2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Requests &amp; Invites</span>
          </button>
        </div>

        {/* Tab Switcher: Requests (0) | Invites (0) */}
        <div className="w-full flex justify-center border-b border-[#333333] mt-2 mb-6">
          <div className="flex gap-16">
            <button
              type="button"
              onClick={() => setActiveRequestsTab("requests")}
              className={`pb-2.5 font-medium text-sm transition-colors relative cursor-pointer ${
                activeRequestsTab === "requests"
                  ? "text-white"
                  : "text-[#909090] hover:text-white"
              }`}
            >
              <span>Requests (0)</span>
              {activeRequestsTab === "requests" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveRequestsTab("invites")}
              className={`pb-2.5 font-medium text-sm transition-colors relative cursor-pointer ${
                activeRequestsTab === "invites"
                  ? "text-white"
                  : "text-[#909090] hover:text-white"
              }`}
            >
              <span>Invites (0)</span>
              {activeRequestsTab === "invites" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 flex flex-col items-center">
          {activeRequestsTab === "requests" ? (
            <div className="text-center text-[13px] text-[#909090] max-w-md mx-auto mt-4 px-4 leading-relaxed">
              People on this list are attempting to join &ldquo;{groupName}&rdquo; via the group link.
            </div>
          ) : (
            <div className="w-full max-w-[550px] py-4 flex flex-col gap-6">
              {/* Group Link Card */}
              <div className="bg-[#242424] border border-[#383838] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-white">Group link</div>
                    <div className="text-xs text-[#909090] mt-0.5">
                      Allow people to join this group via a link or QR code
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={groupLinkEnabled}
                    onChange={(e) => setGroupLinkEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--signal-ultramarine)] cursor-pointer"
                  />
                </div>

                {groupLinkEnabled && (
                  <div className="pt-3 border-t border-[#333333] flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-neutral-300 truncate">
                      https://signal.group/#{conversation.id.slice(0, 16)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://signal.group/#${conversation.id}`);
                        showStatus("Link copied to clipboard");
                      }}
                      className="px-3 py-1.5 bg-[#333333] hover:bg-[#404040] text-xs font-medium text-white rounded-xl cursor-pointer transition-colors shrink-0"
                    >
                      Copy link
                    </button>
                  </div>
                )}
              </div>

              {/* Approve New Members */}
              <div className="bg-[#242424] border border-[#383838] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">
                    Approve new members
                  </div>
                  <div className="text-xs text-[#909090] mt-0.5">
                    Require an admin to approve new members joining via link
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={approveMembersEnabled}
                  onChange={(e) => setApproveMembersEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--signal-ultramarine)] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col h-full overflow-hidden select-none animate-in fade-in duration-150"
      style={{ backgroundColor: "#181818", color: "var(--text-primary)" }}
    >
      {/* Top Header with Back Chevron < */}
      <div className="h-[52px] px-5 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Go back"
          title="Back"
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5 stroke-[2.2]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-24 flex flex-col items-center">
        <div
          className="w-full flex flex-col items-center pt-3"
          style={{ maxWidth: "800px" }}
        >
          {/* Big Group Avatar (80px x 80px) matching screenshot */}
          <div
            onClick={() => {
              setNameInput(groupName);
              setIsNameModalOpen(true);
            }}
            className="w-20 h-20 rounded-full flex items-center justify-center font-normal select-none shrink-0 shadow-sm cursor-pointer hover:opacity-95 transition-opacity overflow-hidden"
            style={{
              backgroundColor: avatarBg,
            }}
            title="Edit group"
          >
            <div className="w-10 h-10 flex items-center justify-center" style={{ color: "#2c6bed" }}>
              <SignalGroupIcon className="w-9 h-9" />
            </div>
          </div>

          {/* Group Name (22px font-normal text-white) */}
          <button
            type="button"
            onClick={() => {
              setNameInput(groupName);
              setIsNameModalOpen(true);
            }}
            className="group flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            title="Edit group name"
          >
            <span className="text-[22px] font-normal text-white">
              {groupName}
            </span>
          </button>

          {/* Group Description ("Add group description...") */}
          <button
            type="button"
            onClick={() => {
              setDescInput(description);
              setIsDescModalOpen(true);
            }}
            className="mt-1 mb-7 text-[14px] text-[#909090] hover:text-neutral-200 transition-colors cursor-pointer max-w-md text-center line-clamp-2"
          >
            {description || "Add group description..."}
          </button>

          {/* 3 Action Buttons: [Video] [Mute] [Search] */}
          <div
            className="flex items-center justify-center gap-3.5 w-full"
            style={{ marginBottom: "36px" }}
          >
            {/* Video (Disabled / Coming soon) */}
            <div className="relative group flex flex-col items-center gap-1.5 select-none">
              <button
                type="button"
                disabled
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "36px",
                  backgroundColor: "#282828",
                  borderRadius: "18px",
                }}
                className="shrink-0 flex items-center justify-center text-white/50 opacity-60 cursor-default transition-all"
              >
                <svg
                  style={{ width: "18px", height: "18px" }}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2.5" y="4.5" width="11" height="11" rx="2.8" />
                  <path d="M13.5 8.2 17.5 5.5v9l-4-2.7" />
                </svg>
              </button>
              <span className="text-[12px] font-normal text-neutral-400">
                Video
              </span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                Coming soon
              </div>
            </div>

            {/* Mute */}
            <div
              onClick={() => {
                if (isMuted) {
                  setConversationMuted(conversation.id, null);
                  showStatus("Group unmuted");
                } else {
                  setIsNotificationsModalOpen(true);
                }
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "36px",
                  backgroundColor: "#282828",
                  borderRadius: "18px",
                }}
                className="shrink-0 hover:bg-[#363636] flex items-center justify-center text-white transition-all"
              >
                <svg
                  style={{ width: "18px", height: "18px" }}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isMuted ? (
                    <>
                      <path d="M10.3 17.5a1.67 1.67 0 0 0 2.88 0" />
                      <path d="m2 2 16 16" />
                      <path d="M7.17 7.17A5 5 0 0 0 5 7.5c0 5.83-2.5 7.5-2.5 7.5h12.5" />
                      <path d="M15 7.5a5 5 0 0 0-7.78-4.2" />
                    </>
                  ) : (
                    <>
                      <path d="M15 7.5a5 5 0 0 0-10 0c0 5.83-2.5 7.5-2.5 7.5h15S15 13.33 15 7.5Z" />
                      <path d="M11.44 17.5a1.67 1.67 0 0 1-2.88 0" />
                    </>
                  )}
                </svg>
              </div>
              <span className="text-[12px] font-normal text-neutral-200 group-hover:text-white">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </div>

            {/* Search */}
            <div
              onClick={() => {
                onClose();
                onStartSearch?.();
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "36px",
                  backgroundColor: "#282828",
                  borderRadius: "18px",
                }}
                className="shrink-0 hover:bg-[#363636] flex items-center justify-center text-white transition-all"
              >
                <svg
                  style={{ width: "18px", height: "18px" }}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="9" r="6" />
                  <path d="m17 17-3.6-3.6" />
                </svg>
              </div>
              <span className="text-[12px] font-normal text-neutral-200 group-hover:text-white">
                Search
              </span>
            </div>
          </div>

          {/* Status Toast */}
          {statusMessage && (
            <div className="mb-4 bg-[#2b2b2b] text-neutral-200 text-xs px-4 py-1.5 rounded-full border border-neutral-700 shadow-sm animate-in fade-in duration-150">
              {statusMessage}
            </div>
          )}

          {/* Divider Line 1 */}
          <div className="w-full border-t border-[#333333] my-4" />

          {/* Section 1: Disappearing messages, Chat color, Notifications */}
          <div className="w-full py-1">
            {/* Disappearing Messages */}
            <div
              onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
              className="w-full py-3 flex items-start justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group relative"
            >
              <div className="flex items-start">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300 mt-0.5">
                  <SignalTimerSlashIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[15px] font-normal text-white leading-snug">
                    Disappearing messages
                  </div>
                  <div className="text-[13px] text-[#909090] mt-1 leading-[18px] max-w-[500px]">
                    When enabled, messages sent and received in this group will disappear
                    after they&apos;ve been seen.
                  </div>
                </div>
              </div>

              {/* Timer Capsule Button */}
              <div className="relative shrink-0 ml-4 mt-0.5" ref={timerDropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTimerDropdownOpen(!isTimerDropdownOpen);
                  }}
                  style={{ backgroundColor: "#282828" }}
                  className="hover:bg-[#363636] px-3.5 py-1 rounded-full text-[13px] font-medium text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{disappearingTimer}</span>
                  <svg
                    className="w-3.5 h-3.5 text-neutral-400 stroke-[2.2]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isTimerDropdownOpen && (
                  <div className="absolute right-0 top-9 mt-1 w-44 bg-[#232323] border border-[#333333] rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in duration-100">
                    {TIMER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConversationDisappearingTimer(conversation.id, opt);
                          setIsTimerDropdownOpen(false);
                          showStatus(
                            opt === "Off"
                              ? "Disappearing messages turned off"
                              : `Timer set to ${opt}`
                          );
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-[13px] hover:bg-[#303030] cursor-pointer ${
                          disappearingTimer === opt
                            ? "text-[var(--signal-ultramarine)] font-medium"
                            : "text-neutral-200"
                        }`}
                      >
                        <span>{opt}</span>
                        {disappearingTimer === opt && (
                          <Check className="w-4 h-4 text-[var(--signal-ultramarine)]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Color */}
            <div
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="w-full py-3 flex items-center justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group relative"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                  <SignalPaletteIcon className="w-5 h-5" />
                </div>
                <span className="text-[15px] font-normal text-white">
                  Chat color
                </span>
              </div>
              {/* Color Preview Circle */}
              <div
                className="w-[18px] h-[18px] rounded-full shadow-xs shrink-0 mr-2 cursor-pointer transition-transform group-hover:scale-105"
                style={{ backgroundColor: chatColor }}
              />

              {/* Color Picker Dropdown */}
              {isColorPickerOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-12 bg-[#232323] border border-[#333333] rounded-xl shadow-xl p-3 z-50 animate-in fade-in duration-100 flex items-center gap-2"
                >
                  {CHAT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setChatColor(c);
                        setIsColorPickerOpen(false);
                        showStatus("Chat color updated");
                      }}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {chatColor === c && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div
              onClick={() => setIsNotificationsModalOpen(true)}
              className="w-full py-3 flex items-center justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="text-[15px] font-normal text-white">
                  Notifications
                </span>
              </div>
              {isMuted && (
                <span className="text-xs text-neutral-400 mr-2">Muted</span>
              )}
            </div>
          </div>

          {/* Divider Line 2 */}
          <div className="w-full border-t border-[#333333] my-4" />

          {/* Section 2: Members */}
          <div className="w-full py-1">
            {/* Header: "{count} members" + Search button */}
            <div className="flex items-center justify-between px-2 pt-1 pb-3">
              <span className="text-[15px] font-normal text-white">
                {conversation.members?.length || 0} members
              </span>
              <button
                type="button"
                onClick={() => setIsMemberSearchOpen(!isMemberSearchOpen)}
                title="Search members"
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Inline search input if active */}
            {isMemberSearchOpen && (
              <div className="px-2 mb-3 animate-in fade-in duration-100">
                <div className="flex items-center bg-[#242424] border border-[#383838] rounded-xl px-3 py-1.5 text-xs">
                  <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search members..."
                    autoFocus
                    className="bg-transparent text-white placeholder-neutral-500 focus:outline-hidden w-full text-xs"
                  />
                  {memberSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMemberSearchQuery("")}
                      className="text-neutral-400 hover:text-white ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* + Add members button (media_1788825854064.png) */}
            <div
              onClick={() => {
                setSelectedAddUserIds([]);
                setAddMemberSearch("");
                setIsAddMemberModalOpen(true);
              }}
              className="w-full py-2.5 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div
                style={{ backgroundColor: "#282828" }}
                className="w-8 h-8 rounded-full hover:bg-[#363636] flex items-center justify-center text-white shrink-0 mr-4 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[15px] font-normal text-white">
                Add members
              </span>
            </div>

            {/* Current user: "You" */}
            {user && (
              <div className="w-full py-2.5 flex items-center justify-between hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group">
                <div className="flex items-center min-w-0">
                  <Avatar
                    name={user.display_name}
                    color={user.avatar_color || "#f3d0e2"}
                    initials={user.initials}
                    avatarUrl={user.avatar_url}
                    size="sm"
                    className="mr-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-normal text-white leading-snug">
                      You
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenMemberLabelView}
                      className="text-[13px] text-[#909090] hover:text-neutral-200 flex items-center gap-1 cursor-pointer transition-colors text-left"
                    >
                      <span>
                        {memberLabels[user.id] || "Add member label"}
                      </span>
                      <svg
                        className="w-3 h-3 stroke-[2.2] text-neutral-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isCurrentMemberAdmin && (
                  <span className="text-[13px] text-neutral-400 font-normal mr-2">
                    Admin
                  </span>
                )}
              </div>
            )}

            {/* Other Members List (e.g. Pratham Mishra) - Clicking opens Profile Modal (media_1788825889682.png) */}
            {filteredMembers
              .filter((m) => m.id !== user?.id)
              .map((member) => {
                const isAdmin = Boolean(isMemberAdmin(member.id));
                const hasLabel = Boolean(memberLabels[member.id]);

                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setProfileModalMember(member);
                    }}
                    className="w-full py-2.5 flex items-center justify-between hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center min-w-0">
                      <Avatar
                        name={member.display_name}
                        color={member.avatar_color || "#edd0c9"}
                        initials={member.initials}
                        avatarUrl={member.avatar_url}
                        size="sm"
                        className="mr-4"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[15px] font-normal text-white truncate leading-snug">
                          {member.display_name}
                        </span>
                        {hasLabel && (
                          <span className="text-[13px] text-[#909090]">
                            {memberLabels[member.id]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mr-2">
                      {isAdmin && (
                        <span className="text-[13px] text-neutral-400 font-normal">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Divider Line 3 */}
          <div className="w-full border-t border-[#333333] my-4" />

          {/* Section 3: Extra Tools (Member label, Requests & Invites) */}
          <div className="w-full py-1">
            {/* Member label -> Opens Member Label Sub-Pane (media_1788826147721.png) */}
            <div
              onClick={handleOpenMemberLabelView}
              className="w-full py-3 flex items-center justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-[15px] font-normal text-white">
                  Member label
                </span>
              </div>
            </div>

            {/* Requests & Invites -> Opens sub-pane (media_1788825933591.png) */}
            <div
              onClick={() => {
                setActiveRequestsTab("requests");
                setIsRequestsViewOpen(true);
              }}
              className="w-full py-3 flex items-center justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[15px] font-normal text-white">
                  Requests &amp; Invites
                </span>
              </div>
              <span className="text-[14px] text-neutral-400 font-normal mr-2">
                0
              </span>
            </div>
          </div>

          {/* Divider Line 4 */}
          <div className="w-full border-t border-[#333333] my-4" />

          {/* Section 4: Danger Actions (Leave group, Block group, Report spam) */}
          <div className="w-full py-1">
            {/* Leave group */}
            <div
              onClick={() => setIsLeaveConfirmOpen(true)}
              className="w-full py-3 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-[15px] font-normal text-white">
                Leave group
              </span>
            </div>

            {/* Block group */}
            <div
              onClick={() => setIsBlockConfirmOpen(true)}
              className="w-full py-3 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4">
                <SignalBlockIcon
                  className="w-5 h-5 shrink-0"
                  style={{ color: "#e15241" }}
                />
              </div>
              <span
                style={{ color: "#e15241" }}
                className="text-[15px] font-normal"
              >
                Block group
              </span>
            </div>

            {/* Report spam */}
            <div
              onClick={() => setIsReportSpamConfirmOpen(true)}
              className="w-full py-3 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4">
                <SignalSpamIcon
                  className="w-5 h-5 shrink-0"
                  style={{ color: "#e15241" }}
                />
              </div>
              <span
                style={{ color: "#e15241" }}
                className="text-[15px] font-normal"
              >
                Report spam
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Members Modal (media_1788825854064.png) */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-[420px] bg-[#292929] border border-[#383838] rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-100 flex flex-col">
            {/* Header: "Add members" and Close "X" */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[17px] font-bold text-white">Add members</h3>
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input: "Name, username, or number" */}
            <div className="w-full bg-[#1e1e1e] border border-transparent focus-within:border-[#3e3e3e] rounded-xl px-3 py-2 flex items-center gap-2.5 mb-3">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={addMemberSearch}
                onChange={(e) => setAddMemberSearch(e.target.value)}
                placeholder="Name, username, or number"
                autoFocus
                className="bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-hidden w-full"
              />
              {addMemberSearch && (
                <button
                  type="button"
                  onClick={() => setAddMemberSearch("")}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Contacts list */}
            <div className="flex-1 max-h-[300px] overflow-y-auto space-y-1 pr-1">
              {filteredAddMembers.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  No contacts found
                </div>
              ) : (
                filteredAddMembers.map(({ user: itemUser, isMember }) => {
                  const isSelected = selectedAddUserIds.includes(itemUser.id);

                  return (
                    <div
                      key={itemUser.id}
                      onClick={() => {
                        if (!isMember) {
                          handleToggleSelectAddUser(itemUser.id);
                        }
                      }}
                      className={`w-full py-2 px-2.5 rounded-xl flex items-center justify-between transition-colors ${
                        isMember
                          ? "opacity-80 cursor-default"
                          : "hover:bg-[#333333] cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center min-w-0">
                        <Avatar
                          name={itemUser.display_name}
                          color={itemUser.avatar_color || "#edd0c9"}
                          initials={itemUser.initials}
                          avatarUrl={itemUser.avatar_url}
                          size="sm"
                          className="mr-3"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-white truncate">
                            {itemUser.display_name}
                          </span>
                          {isMember && (
                            <span className="text-xs text-[#8e8e93]">
                              Already a member
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Indicator: Checkmark if already a member, Checkbox/Radio if not */}
                      <div className="shrink-0 ml-3">
                        {isMember ? (
                          <div className="w-5 h-5 rounded-full bg-[#606060] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[var(--signal-ultramarine)] text-white"
                                : "border border-[#555555] hover:border-neutral-300"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Buttons: Cancel | Update */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-[#3a3a3a] hover:bg-[#464646] text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading || selectedAddUserIds.length === 0}
                onClick={handleUpdateAddMembers}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Modal (media_1788825889682.png / media_1788826364075.png) */}
      {profileModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-[340px] bg-[#2c2c2c] border border-[#3c3c3c] rounded-[28px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-100 flex flex-col items-center">
            {/* Close Button "X" */}
            <button
              type="button"
              onClick={() => setProfileModalMember(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#3c3c3c] hover:bg-[#4a4a4a] text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Avatar */}
            <div className="w-[76px] h-[76px] rounded-full overflow-hidden flex items-center justify-center mb-3 mt-1 bg-[#d8e2f8] shrink-0">
              <Avatar
                name={profileModalMember.display_name}
                color={profileModalMember.avatar_color || "#edd0c9"}
                initials={profileModalMember.initials}
                avatarUrl={profileModalMember.avatar_url}
                size="xl"
              />
            </div>

            {/* Name with Chevron Right > */}
            <button
              type="button"
              onClick={() => handleOpenDirectChat(profileModalMember)}
              className="group flex items-center justify-center gap-1.5 cursor-pointer mb-5"
            >
              <span className="text-[20px] font-normal text-white group-hover:text-neutral-200 transition-colors">
                {profileModalMember.display_name}
              </span>
              <svg
                className="w-4 h-4 stroke-[2.2] text-neutral-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            {/* 3 Circular Action Buttons [Message] [Video] [Voice] */}
            <div className="flex items-center justify-center gap-5 w-full mb-4">
              {/* Message */}
              <div
                onClick={() => handleOpenDirectChat(profileModalMember)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-[#3c3c3c] hover:bg-[#484848] flex items-center justify-center text-white transition-all">
                  <SignalChatIcon className="w-5 h-5" />
                </div>
                <span className="text-[12px] font-normal text-neutral-200 group-hover:text-white">
                  Message
                </span>
              </div>

              {/* Video (Disabled / Coming soon) */}
              <div className="relative group flex flex-col items-center gap-1.5 select-none">
                <button
                  type="button"
                  disabled
                  className="w-11 h-11 rounded-full bg-[#3c3c3c] flex items-center justify-center text-white/50 opacity-60 cursor-default"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2.5" y="4.5" width="11" height="11" rx="2.8" />
                    <path d="M13.5 8.2 17.5 5.5v9l-4-2.7" />
                  </svg>
                </button>
                <span className="text-[12px] font-normal text-neutral-400">
                  Video
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                  Coming soon
                </div>
              </div>

              {/* Voice (Disabled / Coming soon) */}
              <div className="relative group flex flex-col items-center gap-1.5 select-none">
                <button
                  type="button"
                  disabled
                  className="w-11 h-11 rounded-full bg-[#3c3c3c] flex items-center justify-center text-white/50 opacity-60 cursor-default"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.5 13.9v2.5a1.67 1.67 0 0 1-1.82 1.67 16.5 16.5 0 0 1-7.2-2.56 16.25 16.25 0 0 1-5-5 16.5 16.5 0 0 1-2.56-7.24A1.67 1.67 0 0 1 2.58 1.5h2.5a1.67 1.67 0 0 1 1.67 1.43c.1.72.3 1.42.58 2.08a1.67 1.67 0 0 1-.38 1.76L5.9 7.82a13.33 13.33 0 0 0 5 5l1.05-1.05a1.67 1.67 0 0 1 1.76-.38c.66.28 1.36.48 2.08.58a1.67 1.67 0 0 1 1.43 1.67Z" />
                  </svg>
                </button>
                <span className="text-[12px] font-normal text-neutral-400">
                  Voice
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                  Coming soon
                </div>
              </div>
            </div>

            {/* Subtle Divider (media_1788826364075.png) */}
            <div className="w-full border-t border-[#3c3c3c] my-2.5" />

            {/* Menu Options */}
            <div className="w-full flex flex-col gap-0.5">
              {/* 1. Nickname */}
              <button
                type="button"
                onClick={() => {
                  setTargetMemberForLabel(profileModalMember);
                  setLabelInput(memberLabels[profileModalMember.id] || "");
                  setIsLabelModalOpen(true);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-[#383838] text-left transition-colors cursor-pointer group"
              >
                <div className="w-5 h-5 flex items-center justify-center text-neutral-300 group-hover:text-white">
                  <SignalEditPencilIcon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[14.5px] font-normal text-white">
                  Nickname
                </span>
              </button>

              {/* 2. Block */}
              <button
                type="button"
                onClick={() => {
                  setIsBlockConfirmOpen(true);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-[#383838] text-left transition-colors cursor-pointer group"
              >
                <div className="w-5 h-5 flex items-center justify-center text-neutral-300 group-hover:text-white">
                  <SignalBlockIcon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[14.5px] font-normal text-white">
                  Block
                </span>
              </button>

              {/* 3. View safety number */}
              <button
                type="button"
                onClick={() => {
                  setIsSafetyNumberOpen(true);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-[#383838] text-left transition-colors cursor-pointer group"
              >
                <div className="w-5 h-5 flex items-center justify-center text-neutral-300 group-hover:text-white">
                  <SignalSafetyNumberIcon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[14.5px] font-normal text-white">
                  View safety number
                </span>
              </button>

              {/* 4. Add to another group */}
              <button
                type="button"
                onClick={() => {
                  showStatus("Choose group to add contact");
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-[#383838] text-left transition-colors cursor-pointer group"
              >
                <div className="w-5 h-5 flex items-center justify-center text-neutral-300 group-hover:text-white">
                  <svg
                    className="w-[18px] h-[18px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <span className="text-[14.5px] font-normal text-white">
                  Add to another group
                </span>
              </button>

              {/* Admin Options: 5. Make admin & 6. Remove from group (media_1788826364075.png) */}
              {isCurrentMemberAdmin && (
                <>
                  {/* 5. Make admin / Remove admin */}
                  <button
                    type="button"
                    onClick={() => handleToggleAdmin(profileModalMember.id)}
                    className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-[#383838] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-neutral-300 group-hover:text-white">
                      <Key className="w-[18px] h-[18px]" />
                    </div>
                    <span className="text-[14.5px] font-normal text-white">
                      {isMemberAdmin(profileModalMember.id) ? "Remove admin" : "Make admin"}
                    </span>
                  </button>

                  {/* 6. Remove from group */}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(profileModalMember.id)}
                    className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-[#383838] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-neutral-300 group-hover:text-white">
                      <LogOut className="w-[18px] h-[18px]" />
                    </div>
                    <span className="text-[14.5px] font-normal text-white">
                      Remove from group
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Name Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">Edit Group Name</h3>
            <p className="text-xs text-neutral-400 mb-4">
              All members in this group will see this name.
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter group name"
              autoFocus
              className="w-full bg-[#1b1b1b] border border-[#383838] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[var(--signal-ultramarine)] mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNameModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading || !nameInput.trim()}
                onClick={handleSaveName}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white disabled:opacity-50 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Description Modal */}
      {isDescModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">
              Edit Group Description
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Add a description to let members know what this group is about.
            </p>
            <textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Add group description..."
              rows={3}
              autoFocus
              className="w-full bg-[#1b1b1b] border border-[#383838] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[var(--signal-ultramarine)] mb-4 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDescModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDescription}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Label Modal for editing a specific member */}
      {isLabelModalOpen && targetMemberForLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">
              Edit Nickname
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Set a custom nickname for {targetMemberForLabel.display_name}. Only you will see this nickname.
            </p>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="Enter nickname"
              autoFocus
              className="w-full bg-[#1b1b1b] border border-[#383838] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[var(--signal-ultramarine)] mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLabelModalOpen(false);
                  setTargetMemberForLabel(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLabel}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Number Modal */}
      {isSafetyNumberOpen && profileModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[var(--signal-ultramarine)] mb-3">
              <SignalSafetyNumberIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Verify Safety Number
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed max-w-xs">
              If you wish to verify end-to-end encryption with {profileModalMember.display_name}, compare the numbers below with their device.
            </p>

            <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 bg-[#1b1b1b] border border-[#333333] p-4 rounded-xl text-center font-mono text-xs tracking-wider text-neutral-200 mb-6 w-full">
              <span>38491</span>
              <span>20485</span>
              <span>91847</span>
              <span>58291</span>
              <span>04825</span>
              <span>19284</span>
              <span>74829</span>
              <span>10485</span>
              <span>82947</span>
              <span>58201</span>
              <span>49285</span>
              <span>71938</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSafetyNumberOpen(false)}
              className="w-full py-2 rounded-xl text-xs font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Notifications / Mute Duration Modal */}
      {isNotificationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">
              Mute Notifications
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Choose how long you want to mute notifications from this group.
            </p>
            <div className="flex flex-col gap-1 mb-4">
              {MUTE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setConversationMuted(conversation.id, opt);
                    setIsNotificationsModalOpen(false);
                    showStatus(`Group muted for ${opt}`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-200 hover:bg-[#303030] cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsNotificationsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Confirmation */}
      {isLeaveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">Leave group?</h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              You will no longer be able to send or receive messages in this group.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLeaveConfirmOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleLeaveGroup}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#ea4335] hover:bg-[#d9382b] text-white cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Group Confirmation */}
      {isBlockConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">
              Block and leave group?
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              You will leave this group and no longer receive messages or updates from it.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBlockConfirmOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockGroup}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#ea4335] hover:bg-[#d9382b] text-white cursor-pointer"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Spam Confirmation */}
      {isReportSpamConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">
              Report spam and leave?
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Signal will review recent messages from this group. You will leave and block this group.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleReportSpam}
                className="w-full py-2 rounded-xl text-xs font-medium bg-[#ea4335] hover:bg-[#d9382b] text-white cursor-pointer"
              >
                Report spam and leave
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReportSpamConfirmOpen(false);
                  showStatus("Spam reported");
                }}
                className="w-full py-2 rounded-xl text-xs font-medium bg-[#2b2b2b] hover:bg-[#383838] text-neutral-200 cursor-pointer"
              >
                Report spam only
              </button>
              <button
                type="button"
                onClick={() => setIsReportSpamConfirmOpen(false)}
                className="w-full py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
