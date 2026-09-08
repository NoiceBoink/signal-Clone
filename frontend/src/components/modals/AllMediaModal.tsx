"use client";

import React, { useState, useMemo } from "react";
import { X, Image as ImageIcon, FileText, Music } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function AllMediaModal() {
  const {
    isAllMediaOpen,
    setIsAllMediaOpen,
    activeConversation,
    messages,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"media" | "files" | "audio">("media");

  const conversationMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages[activeConversation.id] || [];
  }, [activeConversation, messages]);

  const mediaItems = useMemo(() => {
    return conversationMessages.filter((m) => m.message_type === "image");
  }, [conversationMessages]);

  const fileItems = useMemo(() => {
    return conversationMessages.filter((m) => m.message_type === "file");
  }, [conversationMessages]);

  const audioItems = useMemo(() => {
    return conversationMessages.filter((m) => m.message_type === "audio");
  }, [conversationMessages]);

  if (!isAllMediaOpen || !activeConversation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100 select-none">
      <div
        style={{ backgroundColor: "#222222" }}
        className="w-full max-w-2xl bg-[#222222] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[560px] select-none"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#333333]">
          <div className="flex items-center gap-3">
            <h2 className="text-[17px] font-bold text-white">All media</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAllMediaOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#333333] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-[#333333] px-5 gap-6 text-[14px]">
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`py-3 font-medium transition-colors relative cursor-pointer ${
              activeTab === "media"
                ? "text-white font-semibold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>Media</span>
            {mediaItems.length > 0 && (
              <span className="ml-1.5 text-xs text-neutral-400">({mediaItems.length})</span>
            )}
            {activeTab === "media" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--signal-ultramarine)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("files")}
            className={`py-3 font-medium transition-colors relative cursor-pointer ${
              activeTab === "files"
                ? "text-white font-semibold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>Files</span>
            {fileItems.length > 0 && (
              <span className="ml-1.5 text-xs text-neutral-400">({fileItems.length})</span>
            )}
            {activeTab === "files" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--signal-ultramarine)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`py-3 font-medium transition-colors relative cursor-pointer ${
              activeTab === "audio"
                ? "text-white font-semibold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>Audio</span>
            {audioItems.length > 0 && (
              <span className="ml-1.5 text-xs text-neutral-400">({audioItems.length})</span>
            )}
            {activeTab === "audio" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--signal-ultramarine)]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "media" && (
            mediaItems.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square rounded-xl overflow-hidden bg-[#181818] border border-[#333333] group relative cursor-pointer"
                  >
                    <img
                      src={item.content}
                      alt="Media attachment"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-neutral-400 mb-3">
                  <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="text-[15px] font-medium text-white mb-1">
                  No media
                </div>
                <div className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                  Photos and videos sent in this chat will appear here.
                </div>
              </div>
            )
          )}

          {activeTab === "files" && (
            fileItems.length > 0 ? (
              <div className="flex flex-col gap-2">
                {fileItems.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-[#2a2a2a] hover:bg-[#333333] rounded-xl transition-colors cursor-pointer border border-[#383838]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1e1e1e] flex items-center justify-center text-neutral-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{file.content}</div>
                      <div className="text-xs text-neutral-400">Document</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-neutral-400 mb-3">
                  <FileText className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="text-[15px] font-medium text-white mb-1">
                  No files
                </div>
                <div className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                  Documents and files shared in this chat will appear here.
                </div>
              </div>
            )
          )}

          {activeTab === "audio" && (
            audioItems.length > 0 ? (
              <div className="flex flex-col gap-2">
                {audioItems.map((audio) => (
                  <div
                    key={audio.id}
                    className="flex items-center gap-3 p-3 bg-[#2a2a2a] hover:bg-[#333333] rounded-xl transition-colors cursor-pointer border border-[#383838]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1e1e1e] flex items-center justify-center text-neutral-300">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{audio.content}</div>
                      <div className="text-xs text-neutral-400">Audio file</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-neutral-400 mb-3">
                  <Music className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="text-[15px] font-medium text-white mb-1">
                  No audio
                </div>
                <div className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                  Voice messages and audio clips shared in this chat will appear here.
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}