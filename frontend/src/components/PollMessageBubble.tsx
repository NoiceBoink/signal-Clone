"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { Message } from "@/lib/api";
import { formatMessageTimestamp } from "@/lib/utils";
import { ReceiptIcon } from "./ReceiptIcon";
import { SignalPinSlantedIcon } from "./SignalIcons";
import { PollDetailsModal } from "./modals/PollDetailsModal";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export interface PollData {
  question: string;
  options: string[];
  allow_multiple: boolean;
  votes?: Record<number, string[]>; // option index -> array of user_ids
  ended?: boolean;
}

interface PollMessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  currentUserId?: string;
  onVote: (messageId: string, optionIndex: number) => void;
  showTimestamp?: boolean;
  isPinned?: boolean;
}

export function PollMessageBubble({
  message,
  isOutgoing,
  currentUserId,
  onVote,
  showTimestamp = true,
  isPinned = false,
}: PollMessageBubbleProps) {
  const { user } = useAuth();
  const { endPoll, activeConversation, contacts } = useAppStore();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  let pollData: PollData;
  try {
    pollData = JSON.parse(message.content);
  } catch {
    pollData = {
      question: message.content,
      options: ["Option 1", "Option 2"],
      allow_multiple: true,
      votes: {},
    };
  }

  const votesMap = pollData.votes || {};
  const allVoterIds = new Set(Object.values(votesMap).flat());
  const uniqueVotersCount = allVoterIds.size;
  const totalVotesCount = Object.values(votesMap).reduce(
    (sum, list) => sum + (list?.length || 0),
    0
  );

  return (
    <div className="w-[280px] sm:w-[310px] text-start select-none py-1">
      {/* Poll Question */}
      <h3 className="text-[16px] font-bold text-white mb-0.5 leading-snug wrap-break-word">
        {pollData.question}
      </h3>

      {/* Poll Subtitle */}
      <div className="text-[13px] text-white/80 font-normal mb-3.5">
        {pollData.ended
          ? "Poll closed"
          : `Poll · ${pollData.allow_multiple ? "Select one or more" : "Select one"}`}
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-3">
        {pollData.options.map((optionText, idx) => {
          const optionVoters = votesMap[idx] || [];
          const optionVotesCount = optionVoters.length;
          const hasVoted = Boolean(currentUserId && optionVoters.includes(currentUserId));
          const percentage =
            uniqueVotersCount > 0 ? (optionVotesCount / uniqueVotersCount) * 100 : 0;

          return (
            <div
              key={idx}
              data-testid={`poll-option-${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                if (pollData.ended) return;
                onVote(message.id, idx);
              }}
              className={`flex items-start gap-3 ${
                pollData.ended ? "cursor-default opacity-85" : "cursor-pointer"
              } group/opt`}
            >
              {/* Radio / Check Circle */}
              <div className="mt-0.5 shrink-0">
                {hasVoted ? (
                  <div className="w-5 h-5 rounded-full bg-white text-[#2c6bed] flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-white/70 group-hover/opt:border-white transition-colors" />
                )}
              </div>

              {/* Option Text and Progress Bar */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14.5px] font-medium text-white wrap-break-word">
                    {optionText}
                  </span>
                  {totalVotesCount > 0 && (
                    <span className="text-[13px] text-white/80 font-semibold shrink-0">
                      {optionVotesCount}
                    </span>
                  )}
                </div>

                {/* Progress bar track */}
                <div className="w-full h-2 rounded-full bg-white/25 overflow-hidden mt-1.5 relative">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Status: "No votes" (when 0 votes) OR "View votes" button (when >0 votes) */}
      {totalVotesCount === 0 ? (
        <div className="text-[13px] font-medium text-white/80 text-center my-2 select-none">
          No votes
        </div>
      ) : (
        <div className="flex justify-center my-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen(true);
            }}
            data-testid="view-votes-button"
            className="px-5 py-1.5 rounded-full bg-[#e2e5ee] hover:bg-white active:bg-[#d5d8e3] text-[#1c1c1e] text-[13.5px] font-semibold transition-colors cursor-pointer select-none shadow-xs"
          >
            View votes
          </button>
        </div>
      )}

      {/* Timestamp & Receipt at bottom right */}
      {showTimestamp && (
        <div
          className={`flex justify-end items-center gap-1 mt-1 text-[11px] select-none ${
            isOutgoing ? "text-white/80" : "text-[var(--text-muted)]"
          }`}
        >
          <span>{formatMessageTimestamp(message.created_at)}</span>
          {isPinned && <SignalPinSlantedIcon className="w-3 h-3 text-white/70" />}
          {isOutgoing && (
            <ReceiptIcon status={message.status} className="w-[15px] h-[11px] text-white" />
          )}
        </div>
      )}

      {/* Poll Details Modal */}
      <PollDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        pollData={pollData}
        isCreator={isOutgoing}
        onEndPoll={() => {
          endPoll(message.id);
        }}
        members={activeConversation?.members || []}
        currentUser={user}
        contacts={contacts}
      />
    </div>
  );
}

