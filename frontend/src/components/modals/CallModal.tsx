"use client";

import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Avatar } from "../Avatar";

export function CallModal() {
  const { user } = useAuth();
  const { isCallModalOpen, callType, endCall, activeConversation } = useAppStore();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");

  if (!isCallModalOpen) return null;

  const isGroup = activeConversation?.is_group;
  const otherUser = !isGroup
    ? activeConversation?.members?.find((m) => m.id !== user?.id)
    : null;

  const displayName = isGroup
    ? activeConversation?.group_name || "Group Call"
    : otherUser?.display_name || "Signal Contact";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1a1a1a] text-white rounded-3xl p-8 flex flex-col items-center justify-between min-h-[460px] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--signal-ultramarine)]" />
            <span>Simulated E2E Call</span>
          </div>
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
            Coming Soon Placeholder
          </span>
        </div>

        {/* Center: Pulsing Avatar & Calling State */}
        <div className="flex flex-col items-center my-auto">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-[var(--signal-ultramarine)]/30 animate-ping duration-1000" />
            <div className="relative">
              <Avatar
                name={displayName}
                color={activeConversation?.group_avatar_color || otherUser?.avatar_color}
                isGroup={isGroup}
                size="xl"
                className="w-24 h-24 text-3xl ring-4 ring-white/10"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mb-1 tracking-tight">
            {displayName}
          </h3>

          <p className="text-sm text-white/60 animate-pulse">
            Calling...
          </p>

          {/* Simulated Audio Waveform */}
          <div className="flex items-center gap-1 mt-6 h-6">
            {[40, 75, 55, 90, 60, 80, 45, 95, 65, 50].map((height, i) => (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className="w-1 bg-[var(--signal-ultramarine)] rounded-full animate-pulse duration-700"
              />
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

