"use client";

import React, { useState, useRef } from "react";
import { X, Smile } from "lucide-react";

interface PollCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPoll: (question: string, options: string[], allowMultiple: boolean) => void;
}

const COMMON_EMOJIS = ["👍", "👎", "❤️", "🔥", "🎉", "👏", "😊", "😂", "🤔", "👀", "✅", "❌"];

export function PollCreateModal({ isOpen, onClose, onSendPoll }: PollCreateModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [activeEmojiPickerIdx, setActiveEmojiPickerIdx] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options];
    next[index] = val;

    // "one extra option text box opens when last option is filled"
    // If typing in the last option and it's non-empty, add the next option (up to 10 max)
    if (index === next.length - 1 && val.trim().length > 0 && next.length < 10) {
      next.push("");
    }

    // If second-to-last becomes empty and last is empty, remove the redundant trailing empty option
    if (
      next.length > 2 &&
      index === next.length - 2 &&
      val.trim().length === 0 &&
      next[next.length - 1].trim().length === 0
    ) {
      next.pop();
    }

    setOptions(next);
  };

  const handleAddEmoji = (index: number, emoji: string) => {
    const next = [...options];
    next[index] = (next[index] || "") + emoji;

    // Trigger expansion if this was the last option
    if (index === next.length - 1 && next[index].trim().length > 0 && next.length < 10) {
      next.push("");
    }

    setOptions(next);
    setActiveEmojiPickerIdx(null);
    inputRefs.current[index]?.focus();
  };

  const handleSend = () => {
    const validQuestion = question.trim();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!validQuestion || validOptions.length < 2) return;

    onSendPoll(validQuestion, validOptions, allowMultiple);
    // Reset
    setQuestion("");
    setOptions(["", ""]);
    setAllowMultiple(true);
    setActiveEmojiPickerIdx(null);
    onClose();
  };

  const isSendDisabled =
    !question.trim() || options.map((o) => o.trim()).filter(Boolean).length < 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => {
          setActiveEmojiPickerIdx(null);
          onClose();
        }}
      />

      <div className="relative w-full max-w-[420px] bg-[#282828] border border-[#3e3e3e]/80 rounded-3xl p-5 shadow-2xl shadow-black z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-7" />
          <h2 className="text-[15px] font-bold text-white text-center flex-1">
            New poll
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#383838] hover:bg-[#484848] text-[#d1d1d1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Field */}
        <div className="mb-4">
          <label className="text-[13px] font-semibold text-white/90 mb-2 block">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question"
            autoFocus
            className="w-full bg-[#1e1e1e] border border-[#3e3e3e] focus:border-[#5468ff] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8e8e93] focus:outline-hidden transition-colors"
          />
        </div>

        {/* Options Field */}
        <div className="mb-2">
          <label className="text-[13px] font-semibold text-white/90 mb-2 block">
            Options
          </label>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-0.5">
            {options.map((opt, idx) => (
              <div key={idx} className="relative">
                <div className="relative flex items-center bg-[#1e1e1e] border border-[#3e3e3e] focus-within:border-[#5468ff] rounded-xl px-3.5 py-2.5 transition-colors">
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full bg-transparent text-white placeholder-[#8e8e93] focus:outline-hidden pr-8 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setActiveEmojiPickerIdx(activeEmojiPickerIdx === idx ? null : idx)
                    }
                    className="absolute right-3 text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                {/* Emoji Dropdown for this Option */}
                {activeEmojiPickerIdx === idx && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setActiveEmojiPickerIdx(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-[#222222] border border-[#3e3e3e] rounded-xl p-2 shadow-xl z-30 grid grid-cols-6 gap-1 w-[200px] animate-in fade-in zoom-in-95 duration-100">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleAddEmoji(idx, emoji)}
                          className="w-7 h-7 flex items-center justify-center text-[16px] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#383838] my-4" />

        {/* Allow multiple votes toggle */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[14px] font-normal text-white">
            Allow multiple votes
          </span>
          <button
            type="button"
            onClick={() => setAllowMultiple(!allowMultiple)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              allowMultiple ? "bg-[#5468ff]" : "bg-[#3e3e3e]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                allowMultiple ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#3e3e3e] hover:bg-[#484848] text-[13.5px] font-medium text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSendDisabled}
            onClick={handleSend}
            className="px-5 py-2 rounded-full bg-[#5468ff] hover:bg-[#4557ea] text-[13.5px] font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ml-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

