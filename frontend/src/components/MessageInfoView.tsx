"use client";

import React, { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { Message, Conversation, User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar } from "./Avatar";
import { ReceiptIcon } from "./ReceiptIcon";

interface MessageInfoViewProps {
  message: Message;
  conversation: Conversation;
  onClose: () => void;
}

function formatInfoTimestamp(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const timePart = `${formattedHours}:${minutes} ${ampm}`;

    const datePrefix = isToday ? "Today" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const epochMs = d.getTime();

    return {
      displayTime: `${datePrefix} ${timePart}`,
      epochMs,
      relative: timePart,
    };
  } catch {
    return {
      displayTime: "Today 12:00 pm",
      epochMs: Date.now(),
      relative: "12:00 pm",
    };
  }
}

export function MessageInfoView({
  message,
  conversation,
  onClose,
}: MessageInfoViewProps) {
  const { user } = useAuth();

  const isOutgoing = user ? message.sender_id === user.id : false;

  // Sender info
  const sender = useMemo(() => {
    if (message.sender) return message.sender;
    const member = conversation.members?.find((m) => m.id === message.sender_id);
    if (member) return member;
    return {
      id: message.sender_id,
      username: "User",
      display_name: "User",
      avatar_color: "#5468ff",
      initials: "U",
    };
  }, [message.sender, message.sender_id, conversation.members]);

  // Recipient members for outgoing message
  const recipients: User[] = useMemo(() => {
    if (!conversation.members) return [];
    return conversation.members.filter((m) => m.id !== user?.id);
  }, [conversation.members, user?.id]);

  const timeInfo = useMemo(() => {
    return formatInfoTimestamp(message.created_at);
  }, [message.created_at]);

  // Received time for incoming messages (simulated a few seconds after sent)
  const receivedTimeInfo = useMemo(() => {
    const sentDate = new Date(message.created_at);
    const receivedDate = new Date(sentDate.getTime() + 3990); // ~4 seconds later
    return formatInfoTimestamp(receivedDate.toISOString());
  }, [message.created_at]);

  return (
    <div className="w-full h-full bg-[#181818] overflow-y-auto flex flex-col select-none text-left animate-in fade-in duration-150">
      {/* Top Left: Back button */}
      <div className="p-3">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[560px] mx-auto px-6 pt-2 pb-16 flex flex-col">
        {/* ======================================================== */}
        {/* MESSAGE BUBBLE PREVIEW                                   */}
        {/* ======================================================== */}
        {isOutgoing ? (
          <div className="flex justify-end mb-8">
            <div className="bg-[#2c6bed] text-white rounded-[18px] px-3.5 py-1.5 flex items-baseline gap-2.5 max-w-[80%] text-[14px] shadow-xs break-words">
              <span>{message.content}</span>
              <span className="text-[11px] text-white/80 flex items-center gap-1 shrink-0">
                <span>{timeInfo.relative}</span>
                <ReceiptIcon
                  status={message.status || "read"}
                  className="w-[18px] h-[12px] text-white"
                />
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-start items-end gap-2.5 mb-8">
            {/* If group incoming message, show sender avatar */}
            {conversation.is_group && (
              <Avatar
                name={sender.display_name}
                color={sender.avatar_color}
                initials={sender.initials}
                avatarUrl={sender.avatar_url}
                size="author"
                className="shrink-0 mb-0.5"
              />
            )}

            <div className="bg-[#2b2b2b] text-white rounded-[18px] px-3.5 py-1.5 flex flex-col max-w-[80%] text-[14px] shadow-xs break-words">
              {/* If group incoming message, show sender name */}
              {conversation.is_group && (
                <span
                  className="text-[12.5px] font-semibold mb-0.5 leading-tight"
                  style={{ color: sender.avatar_color || "#5ca7f3" }}
                >
                  {sender.display_name}
                </span>
              )}
              <div className="flex items-baseline justify-between gap-2.5">
                <span>{message.content}</span>
                <span className="text-[11px] text-neutral-400 shrink-0">
                  {timeInfo.relative}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TIMESTAMPS TABLE (Sent, Received)                        */}
        {/* ======================================================== */}
        <div className="space-y-1.5">
          {/* Sent row */}
          <div className="flex items-center text-[13.5px]">
            <span className="w-24 font-bold text-white shrink-0">Sent</span>
            <span className="text-neutral-300">
              {timeInfo.displayTime} ({timeInfo.epochMs})
            </span>
          </div>

          {/* Received row (shown only when receiver) */}
          {!isOutgoing && (
            <div className="flex items-center text-[13.5px]">
              <span className="w-24 font-bold text-white shrink-0">Received</span>
              <span className="text-neutral-300">
                {receivedTimeInfo.displayTime} ({receivedTimeInfo.epochMs})
              </span>
            </div>
          )}
        </div>

        {/* Divider Line */}
        <div className="border-b border-[#2e2e2e] my-5" />

        {/* ======================================================== */}
        {/* STATUS / PEOPLE SECTION                                  */}
        {/* ======================================================== */}
        {isOutgoing ? (
          <div>
            {/* Header: Read by / Delivered to + Receipt icon on right */}
            <div className="flex items-center justify-between text-[13.5px] font-bold text-white mb-3">
              <span>{conversation.is_group ? "Delivered to" : "Read by"}</span>
              <ReceiptIcon
                status={conversation.is_group ? "delivered" : "read"}
                className="w-5 h-3.5 text-neutral-400"
              />
            </div>

            {/* Recipient Rows */}
            <div className="space-y-1">
              {recipients.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={member.display_name}
                      color={member.avatar_color}
                      initials={member.initials}
                      avatarUrl={member.avatar_url}
                      size="sm"
                      className="w-8 h-8 shrink-0"
                    />
                    <span className="text-[14px] font-medium text-white">
                      {member.display_name}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {timeInfo.displayTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Header: From */}
            <div className="text-[13.5px] font-bold text-white mb-3">From</div>

            {/* Sender Row */}
            <div className="flex items-center gap-3 py-2">
              <Avatar
                name={sender.display_name}
                color={sender.avatar_color}
                initials={sender.initials}
                avatarUrl={sender.avatar_url}
                size="sm"
                className="w-8 h-8 shrink-0"
              />
              <span className="text-[14px] font-medium text-white">
                {sender.display_name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

