"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Avatar } from "../Avatar";
import { User } from "@/lib/api";
import { PollData } from "../PollMessageBubble";

interface PollDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollData: PollData;
  isCreator: boolean;
  onEndPoll?: () => void;
  members?: User[];
  currentUser?: User | null;
  contacts?: User[];
}

export function PollDetailsModal({
  isOpen,
  onClose,
  pollData,
  isCreator,
  onEndPoll,
  members = [],
  currentUser = null,
  contacts = [],
}: PollDetailsModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const votesMap = pollData.votes || {};

  // Resolve user details for a given voter ID
  const resolveUser = (userId: string): { display_name: string; initials: string; avatar_color: string; avatar_url?: string | null } => {
    if (currentUser && currentUser.id === userId) {
      return {
        display_name: currentUser.display_name || currentUser.username,
        initials: currentUser.initials || "U",
        avatar_color: currentUser.avatar_color || "#edd0c9",
        avatar_url: currentUser.avatar_url,
      };
    }
    const member = members.find((m) => m.id === userId);
    if (member) {
      return {
        display_name: member.display_name || member.username,
        initials: member.initials || "U",
        avatar_color: member.avatar_color || "#edd0c9",
        avatar_url: member.avatar_url,
      };
    }
    const contact = contacts.find((c) => c.id === userId);
    if (contact) {
      return {
        display_name: contact.display_name || contact.username,
        initials: contact.initials || "U",
        avatar_color: contact.avatar_color || "#edd0c9",
        avatar_url: contact.avatar_url,
      };
    }
    return {
      display_name: "User",
      initials: "U",
      avatar_color: "#888888",
    };
  };

  // Find max votes to determine top option(s) for the star badge
  const voteCounts = Object.values(votesMap).map((list) => list?.length || 0);
  const maxVotes = voteCounts.length > 0 ? Math.max(...voteCounts, 0) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        style={{ maxWidth: "420px", width: "100%" }}
        className="relative bg-[#29292b] border border-[#38383a] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 select-none text-white max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="poll-details-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="w-7" />
          <h2 className="text-[16px] font-bold text-white text-center flex-1">
            Poll details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-[#3c3c3e] hover:bg-[#4c4c4e] text-[#d1d1d1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 flex-1">
          {/* Question Section */}
          <div className="mb-4">
            <label className="text-[13.5px] font-bold text-white mb-2 block">
              Question
            </label>
            <div className="w-full bg-[#363638] rounded-xl px-3.5 py-2.5 text-[14.5px] text-white/95 select-text">
              {pollData.question}
            </div>
          </div>

          {/* Options & Voters Section */}
          <div className="space-y-4 pt-1">
            {pollData.options.map((optionText, idx) => {
              const voters = votesMap[idx] || [];
              const optionVotesCount = voters.length;
              const isTop = optionVotesCount > 0 && optionVotesCount === maxVotes;

              return (
                <div key={idx} className="space-y-2">
                  {/* Option Title and Vote Count Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14.5px] font-bold text-white leading-tight">
                      {optionText}
                    </span>
                    {optionVotesCount > 0 && (
                      <span className="text-[13px] font-medium text-white/90 flex items-center gap-1 shrink-0">
                        {isTop && <span className="text-white text-[12px]">★</span>}
                        <span>
                          {optionVotesCount} {optionVotesCount === 1 ? "vote" : "votes"}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Voters List or 'No votes' */}
                  {optionVotesCount > 0 ? (
                    <div className="space-y-2 pt-1 pb-1">
                      {voters.map((voterId) => {
                        const voter = resolveUser(voterId);
                        return (
                          <div
                            key={voterId}
                            className="flex items-center gap-2.5 py-0.5"
                            data-testid="poll-voter-item"
                          >
                            <Avatar
                              name={voter.display_name}
                              color={voter.avatar_color}
                              initials={voter.initials}
                              avatarUrl={voter.avatar_url}
                              size="sm"
                            />
                            <span className="text-[14px] font-medium text-white truncate">
                              {voter.display_name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[13px] text-[#8e8e93] font-normal pt-0.5 pb-1">
                      No votes
                    </div>
                  )}

                  {/* Thin divider line between options */}
                  {idx < pollData.options.length - 1 && (
                    <div className="border-t border-[#38383a] pt-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: "End poll" Button (Only if user started the poll) */}
        {isCreator && (
          <div className="flex justify-center pt-5 shrink-0">
            {pollData.ended ? (
              <div className="px-6 py-2 rounded-full bg-[#333335] text-white/50 text-[13.5px] font-medium select-none">
                Poll ended
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onEndPoll?.();
                }}
                data-testid="end-poll-button"
                style={{ backgroundColor: "#48484a" }}
                className="px-6 py-2 rounded-full hover:brightness-110 active:brightness-95 text-white text-[14px] font-medium transition-all cursor-pointer select-none shadow-xs"
              >
                End poll
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
