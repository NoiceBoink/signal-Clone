"use client";

import React from "react";
import { Conversation, User } from "@/lib/api";
import { getInitials, getAvatarTextColor } from "@/lib/utils";

interface ConversationHeroProps {
  conversation: Conversation;
  otherUser: User | null;
  onOpenDetails?: () => void;
}

export function ConversationHero({
  conversation,
  otherUser,
  onOpenDetails,
}: ConversationHeroProps) {
  const isGroup = conversation.is_group;

  const displayName = isGroup
    ? conversation.group_name || "Group"
    : otherUser?.display_name || "Contact";

  const initials = isGroup
    ? getInitials(displayName)
    : otherUser?.initials || getInitials(displayName);

  const avatarBg = isGroup
    ? conversation.group_avatar_color || "#c9d5ed"
    : otherUser?.avatar_color || "#edd0c9";

  const avatarText = getAvatarTextColor(avatarBg);

  return (
    <div className="relative flex flex-col items-center select-none text-center w-full max-w-[276px] mx-auto mt-14 mb-8 pt-0 pb-5 px-5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[28px] shadow-xs">
      {/* Floating Overlapping Avatar */}
      <div
        className="w-[74px] h-[74px] rounded-full flex items-center justify-center font-normal select-none -mt-[37px] shadow-sm transition-transform hover:scale-105 cursor-pointer overflow-hidden"
        style={{
          backgroundColor: avatarBg,
          color: avatarText,
        }}
        onClick={onOpenDetails}
        title={displayName}
      >
        {otherUser?.avatar_url || (displayName.toLowerCase().includes("pratham") && "/pratham_avatar.png") ? (
          <img
            src={otherUser?.avatar_url || "/pratham_avatar.png"}
            alt={displayName}
            className="w-full h-full object-cover rounded-full pointer-events-none"
          />
        ) : (
          <span className="text-[28px] font-normal leading-none tracking-tight">
            {initials}
          </span>
        )}
      </div>

      {/* Name and Chevron */}
      <button
        type="button"
        onClick={onOpenDetails}
        className="group mt-3.5 mb-2.5 inline-flex items-center justify-center gap-1.5 cursor-pointer text-center"
      >
        <span className="text-[17px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--signal-ultramarine)] transition-colors">
          {displayName}
        </span>
        <svg
          className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--signal-ultramarine)] transition-colors shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.5L10.5 8L6 12.5" />
        </svg>
      </button>

      {/* Direct Chat Badges */}
      {!isGroup ? (
        <div className="flex flex-col items-center gap-3 w-full">
          {/* "Name not verified" warning badge */}
          <button
            type="button"
            className="bg-[#2a1d18] dark:bg-[#2a1d18] hover:bg-[#34231d] text-[#db8660] dark:text-[#db8660] px-3.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {/* Authentic Signal person-questionmark icon */}
            <svg
              className="w-3.5 h-3.5 shrink-0 fill-current"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.99998 3.39998C4.40487 3.39998 3.77498 3.95875 3.77498 4.92966C3.77498 5.95712 4.45204 6.59998 4.99998 6.59998C5.54791 6.59998 6.22498 5.95712 6.22498 4.92966C6.22498 3.95875 5.59508 3.39998 4.99998 3.39998ZM2.47498 4.92966C2.47498 3.4153 3.52401 2.09998 4.99998 2.09998C6.47594 2.09998 7.52498 3.4153 7.52498 4.92966C7.52498 6.38749 6.52311 7.89998 4.99998 7.89998C3.47684 7.89998 2.47498 6.38749 2.47498 4.92966Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.43699 12.35H8.56296C8.32128 11.0449 6.91792 9.89998 4.99998 9.89998C3.08203 9.89998 1.67867 11.0449 1.43699 12.35ZM0.0999756 12.75C0.0999756 10.3456 2.41754 8.59998 4.99998 8.59998C7.58241 8.59998 9.89997 10.3456 9.89997 12.75C9.89997 13.2864 9.4526 13.65 8.989 13.65H1.01095C0.547352 13.65 0.0999756 13.2864 0.0999756 12.75Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.9953 3.98566C11.4081 3.71536 11.924 3.59998 12.5 3.59998C13.1867 3.59998 13.7834 3.77834 14.2169 4.12819C14.6583 4.48433 14.9 4.995 14.9 5.57998C14.9 6.05247 14.7642 6.41285 14.5533 6.70697C14.3667 6.96713 14.1246 7.16732 13.9252 7.33228C13.9119 7.3433 13.8987 7.35417 13.8858 7.36489C13.6656 7.54758 13.4925 7.69878 13.3662 7.88966C13.248 8.06839 13.1608 8.29899 13.1608 8.6491V8.73911C13.1608 9.10409 12.865 9.39998 12.5 9.39998C12.135 9.39998 11.8391 9.10409 11.8391 8.73911V8.6491C11.8391 8.12481 11.9659 7.71606 12.1692 7.38234C12.368 7.05615 12.6278 6.82251 12.8525 6.63516C12.8882 6.60547 12.9224 6.57706 12.9554 6.54976C13.3755 6.20159 13.5782 6.03359 13.5782 5.66664C13.5782 5.33551 13.4634 5.12442 13.3011 4.9889C13.1289 4.84511 12.8594 4.75085 12.5 4.75085C12.1491 4.75085 11.9156 4.82821 11.7629 4.93681C11.6155 5.04167 11.5065 5.20161 11.4496 5.44446C11.3844 5.72295 11.1375 5.97998 10.7918 5.97998C10.4134 5.97998 10.0555 5.63296 10.1657 5.19553C10.297 4.67462 10.5742 4.26139 10.9953 3.98566Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.75 11C11.75 10.5858 12.0858 10.25 12.5 10.25C12.9142 10.25 13.25 10.5858 13.25 11C13.25 11.4142 12.9142 11.75 12.5 11.75C12.0858 11.75 11.75 11.4142 11.75 11Z"
              />
            </svg>
            <span>Name not verified</span>
          </button>

          {/* "No groups in common" */}
          <div className="inline-flex items-center justify-center gap-2 text-[13px] text-neutral-300 dark:text-neutral-300 font-normal">
            {/* Authentic Signal group icon */}
            <svg
              className="w-4 h-4 shrink-0 fill-current text-neutral-400"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.6 5.059c0-1.438.986-2.709 2.4-2.709s2.4 1.27 2.4 2.709a3.15 3.15 0 0 1-.652 1.938c-.411.52-1.023.903-1.748.903-.725 0-1.337-.382-1.748-.903A3.147 3.147 0 0 1 8.6 5.06ZM11 3.65c-.52 0-1.1.499-1.1 1.409 0 .446.15.85.373 1.133.222.281.485.408.727.408s.505-.127.727-.408c.223-.282.373-.687.373-1.133 0-.91-.58-1.409-1.1-1.409Z"
              />
              <path d="M5 8.6c.698 0 1.37.14 1.977.395-.35.309-.66.66-.917 1.049A3.898 3.898 0 0 0 5 9.9c-1.76 0-3.09 1.121-3.316 2.45h3.582a5.089 5.089 0 0 0 .065 1.3H1.26a.905.905 0 0 1-.911-.9C.35 10.38 2.516 8.6 5 8.6Z" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 8.6c-2.484 0-4.65 1.78-4.65 4.15 0 .534.445.9.91.9h7.48c.465 0 .91-.366.91-.9 0-2.37-2.166-4.15-4.65-4.15Zm0 1.3c1.76 0 3.09 1.122 3.316 2.45H7.684C7.909 11.022 9.24 9.9 11 9.9ZM5 2.35c-1.414 0-2.4 1.27-2.4 2.709 0 .727.241 1.418.652 1.938.411.52 1.023.903 1.748.903.725 0 1.337-.382 1.748-.903A3.15 3.15 0 0 0 7.4 5.059C7.4 3.62 6.414 2.35 5 2.35ZM3.9 5.059c0-.91.58-1.409 1.1-1.409.52 0 1.1.499 1.1 1.409 0 .446-.15.85-.373 1.133-.222.281-.485.408-.727.408s-.505-.127-.727-.408A1.848 1.848 0 0 1 3.9 5.059Z"
              />
            </svg>
            <span>No groups in common</span>
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center justify-center gap-2 text-[13px] text-neutral-300 font-normal">
          <span>{conversation.members?.length || 0} members</span>
        </div>
      )}
    </div>
  );
}
