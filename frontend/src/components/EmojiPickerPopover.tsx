"use client";

import React, { useState, useMemo, useRef } from "react";
import { Search, X, MoreHorizontal } from "lucide-react";

// Category Icons matching Signal Desktop exactly
function SignalSmileCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

function SignalAnimalCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.5 1 1.695-.69 4-4.272 4-5.828Z" />
      <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.5 1-1.695-.69-4-4.272-4-5.828Z" />
      <path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
      <path d="M10 15c.5.5 1.5 1 2 1s1.5-.5 2-1" />
    </svg>
  );
}

function SignalFoodCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h18a1 1 0 0 1 1 1 9 9 0 0 1-9 9 9 9 0 0 1-9-9 1 1 0 0 1 1-1Z" />
      <path d="M6 21h12" />
      <path d="M8 4c0 2-1 3-1 4" />
      <path d="M12 3c0 2-1 3-1 5" />
      <path d="M16 4c0 2-1 3-1 4" />
    </svg>
  );
}

function SignalActivityCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 15.5 9.5 14 13.5 10 13.5 8.5 9.5 12 7" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 7V2" />
      <path d="M15.5 9.5 20.5 7" />
      <path d="M14 13.5 17 19" />
      <path d="M10 13.5 7 19" />
      <path d="M8.5 9.5 3.5 7" />
    </svg>
  );
}

function SignalTravelCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function SignalObjectCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7Z" />
    </svg>
  );
}

function SignalSymbolCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7 8h4" />
      <path d="M9 6v4" />
      <path d="M13 8h4" />
      <path d="M13 16h4" />
      <path d="M13 14h4" />
      <path d="M7 14l4 4" />
      <path d="M11 14l-4 4" />
    </svg>
  );
}

function SignalFlagCategoryIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

// Categorized Emoji Dataset matching Signal Desktop
interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "smileys",
    name: "Smileys & People",
    icon: SignalSmileCategoryIcon,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
      "🙂", "🙃", "🫠", "😉", "😊", "😇", "🥰", "😍",
      "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛",
      "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢", "🫣",
      "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶",
      "🫥", "😶‍🌫️", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥",
      "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
      "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯",
      "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "🫤",
      "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺",
      "🥹", "😦", "😧", "📁", "😰", "😥", "😢", "😭",
      "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱",
      "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️",
      "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖",
      "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿",
      "😾", "🙈", "🙉", "🙊", "💌", "💘", "💝", "💖",
      "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️‍🔥",
      "❤️‍🩹", "❤️", "🩷", "🧡", "💛", "💚", "💙", "🩵",
      "💜", "🤎", "🖤", "🩶", "🤍", "💋", "💯", "💢",
      "💥", "💫", "💦", "💨", "🕳️", "💬", "👁️‍🗨️", "🗨️",
      "🗯️", "💭", "💤", "👋", "🤚", "🖐️", "✋", "🖖",
      "🫱", "🫲", "🫳", "🫴", "🫸", "🫷", "🫵", "👌",
      "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙",
      "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎",
      "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐",
      "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾"
    ],
  },
  {
    id: "animals",
    name: "Animals & Nature",
    icon: SignalAnimalCategoryIcon,
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸",
      "🐵", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥",
      "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄",
      "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰",
      "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢",
      "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞",
      "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈",
      "🦭", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🦣",
      "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬",
      "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙",
      "🌲", "🌳", "🌴", "🪵", "🌱", "🌿", "☘️", "🍀",
      "🎍", "🪴", "🎋", "🍃", "🍂", "🍁", "🍄", "🐚",
      "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼",
      "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖",
      "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "⭐️",
      "🌟", "✨", "⚡️", "☄️", "💥", "🔥", "🌪️", "🌈",
      "☀️", "🌤️", "⛅️", "🌥️", "☁️", "🌦️", "🌧️", "⛈️",
      "🌩️", "🌨️", "❄️", "☃️", "⛄️", "🌬️", "💨", "💧"
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icon: SignalFoodCategoryIcon,
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇",
      "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥",
      "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️",
      "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠",
      "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳",
      "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭",
      "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮",
      "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜",
      "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙",
      "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧",
      "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭",
      "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯",
      "🥛", "🍼", "🫖", "☕️", "🍵", "🧃", "🥤", "🧋",
      "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹"
    ],
  },
  {
    id: "activity",
    name: "Activity",
    icon: SignalActivityCategoryIcon,
    emojis: [
      "⚽️", "🏀", "🏈", "⚾️", "🥎", "🎾", "🏐", "🏉",
      "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍",
      "🏏", "🪃", "🥅", "⛳️", "🪁", "🏹", "🎣", "🤿",
      "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌",
      "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️",
      "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽",
      "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉",
      "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🤹",
      "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹",
      "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻",
      "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩", "🚗"
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    icon: SignalTravelCategoryIcon,
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
      "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🦯", "🦽",
      "🦼", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨", "🚔",
      "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋",
      "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇",
      "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️",
      "🚀", "🛸", "🚁", "🛶", "⛵️", "🚤", "🛥️", "🛳️",
      "⛴️", "🚢", "⚓️", "🛟", "🪝", "⛽️", "🚧", "🚦",
      "🚥", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯",
      "🏟️", "🎡", "🎢", "🎠", "⛲️", "⛱️", "🏖️", "🏝️",
      "🏜️", "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺️", "🛖"
    ],
  },
  {
    id: "objects",
    name: "Objects",
    icon: SignalObjectCategoryIcon,
    emojis: [
      "⌚️", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️",
      "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼",
      "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️",
      "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "⏱️",
      "⏲️", "⏰", "🕰️", "⌛️", "⏳", "📡", "🔋", "🪫",
      "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸",
      "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎",
      "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒️", "🛠️",
      "⛏️", "🪚", "🔩", "⚙️", "🪤", "🧱", "⛓️", "🧲",
      "🔫", "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️", "🛡️"
    ],
  },
  {
    id: "symbols",
    name: "Symbols",
    icon: SignalSymbolCategoryIcon,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
      "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️",
      "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈️",
      "♉️", "♊️", "♋️", "♌️", "♍️", "♎️", "♏️", "♐️",
      "♑️", "♒️", "♓️", "🆔", "⚛️", "🉑", "☢️", "☣️",
      "📴", "📳", "🈶", "🈚️", "🈸", "🈺", "🈷️", "✴️",
      "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹",
      "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌",
      "⭕️", "🛑", "⛔️", "📛", "🚫", "💯", "💢", "♨️"
    ],
  },
  {
    id: "flags",
    name: "Flags",
    icon: SignalFlagCategoryIcon,
    emojis: [
      "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️",
      "🇦🇺", "🇧🇷", "🇨🇦", "🇨🇳", "🇩🇪", "🇪🇸", "🇫🇷", "🇬🇧",
      "🇮🇳", "🇮🇹", "🇯🇵", "🇰🇷", "🇲🇽", "🇷🇺", "🇺🇸", "🇿🇦"
    ],
  },
];

// Sample sticker packs
const SAMPLE_STICKERS = [
  { id: "s1", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80", title: "Cute Cat" },
  { id: "s2", url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=150&auto=format&fit=crop&q=80", title: "Happy Dog" },
  { id: "s3", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=80", title: "Puppy Joy" },
  { id: "s4", url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&auto=format&fit=crop&q=80", title: "Fluffy Cat" },
  { id: "s5", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80", title: "Excited Pup" },
  { id: "s6", url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=150&auto=format&fit=crop&q=80", title: "Gentle Pet" },
];

// Sample GIFs
const SAMPLE_GIFS = [
  { id: "g1", url: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif", title: "Cat Head Tilt" },
  { id: "g2", url: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif", title: "Thumbs Up" },
  { id: "g3", url: "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif", title: "Celebration Dance" },
  { id: "g4", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "High Five" },
  { id: "g5", url: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif", title: "Excited Screaming" },
  { id: "g6", url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif", title: "Applause" },
];

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  onSendSticker?: (stickerUrl: string) => void;
  onSendGif?: (gifUrl: string) => void;
  onClose: () => void;
}

export function EmojiPickerPopover({
  onSelectEmoji,
  onSendSticker,
  onSendGif,
  onClose,
}: EmojiPickerPopoverProps) {
  const [activeTab, setActiveTab] = useState<"emoji" | "stickers" | "gifs">("emoji");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("smileys");
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Filtered emojis based on search
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    // Unique list
    return Array.from(new Set(all));
  }, [searchQuery]);

  const activeCategory = useMemo(() => {
    return EMOJI_CATEGORIES.find((c) => c.id === activeCategoryId) || EMOJI_CATEGORIES[0];
  }, [activeCategoryId]);

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
    setSearchQuery("");
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  return (
    <>
      {/* Invisible Click Outside Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Main Popover Container */}
      <div
        data-testid="emoji-picker-popover"
        className="absolute bottom-full left-0 mb-3 w-[340px] h-[465px] bg-[#272727] border border-[#383838] rounded-2xl shadow-2xl flex flex-col z-50 select-none overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* TOP NAVIGATION TABS: Emoji | Stickers | GIFs            */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("emoji");
              setSearchQuery("");
            }}
            className={`px-4 py-1 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
              activeTab === "emoji"
                ? "bg-[#3d3d3d] text-white"
                : "text-[#9e9e9e] hover:text-white"
            }`}
          >
            Emoji
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("stickers");
              setSearchQuery("");
            }}
            className={`px-4 py-1 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === "stickers"
                ? "bg-[#3d3d3d] text-white font-semibold"
                : "text-[#9e9e9e] hover:text-white"
            }`}
          >
            Stickers
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("gifs");
              setSearchQuery("");
            }}
            className={`px-4 py-1 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === "gifs"
                ? "bg-[#3d3d3d] text-white font-semibold"
                : "text-[#9e9e9e] hover:text-white"
            }`}
          >
            GIFs
          </button>
        </div>

        {/* ======================================================== */}
        {/* SEARCH BAR                                               */}
        {/* ======================================================== */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 bg-[#333333] border border-transparent focus-within:border-[#4a4a4a] rounded-xl px-3 py-1.5 transition-colors">
            <Search className="w-4 h-4 text-[#8e8e93] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "emoji"
                  ? "Search emoji"
                  : activeTab === "stickers"
                  ? "Search stickers"
                  : "Search GIFs"
              }
              className="bg-transparent text-[13px] text-white placeholder-[#8e8e93] outline-none w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#8e8e93] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CONTENT AREA BASED ON TAB                                */}
        {/* ======================================================== */}
        {activeTab === "emoji" && (
          <>
            {/* Category Header Label with ... Menu button */}
            <div className="flex items-center justify-between px-3.5 py-1 text-[13px] font-semibold text-[#8e8e93]">
              <span>{searchQuery ? "Search results" : activeCategory.name}</span>
              <button
                type="button"
                title="Options"
                className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 8-Column Emoji Grid */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin"
            >
              {filteredEmojis ? (
                <div className="grid grid-cols-8 gap-0.5">
                  {filteredEmojis.map((emoji, idx) => (
                    <button
                      key={`${emoji}-${idx}`}
                      type="button"
                      onClick={() => onSelectEmoji(emoji)}
                      className="w-9 h-9 flex items-center justify-center text-[22px] rounded-lg hover:bg-white/10 hover:scale-120 transition-all cursor-pointer select-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-0.5">
                  {activeCategory.emojis.map((emoji, idx) => (
                    <button
                      key={`${emoji}-${idx}`}
                      type="button"
                      onClick={() => onSelectEmoji(emoji)}
                      className="w-9 h-9 flex items-center justify-center text-[22px] rounded-lg hover:bg-white/10 hover:scale-120 transition-all cursor-pointer select-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Category Navigation Bar */}
            <div className="h-10 bg-[#242424] border-t border-[#333333] px-2 flex items-center justify-between shrink-0 select-none">
              {EMOJI_CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const isActive = activeCategoryId === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    title={cat.name}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#3e3e3e] text-white"
                        : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    <IconComp className="w-[18px] h-[18px]" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* STICKERS TAB */}
        {activeTab === "stickers" && (
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <div className="text-[12px] font-semibold text-[#8e8e93] mb-2 px-1">
              Popular Stickers
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_STICKERS.map((stk) => (
                <button
                  key={stk.id}
                  type="button"
                  onClick={() => onSendSticker?.(stk.url)}
                  title={stk.title}
                  className="rounded-xl overflow-hidden bg-[#333333] hover:scale-105 transition-transform aspect-square flex items-center justify-center cursor-pointer border border-[#3e3e3e]"
                >
                  <img
                    src={stk.url}
                    alt={stk.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GIFS TAB */}
        {activeTab === "gifs" && (
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <div className="text-[12px] font-semibold text-[#8e8e93] mb-2 px-1">
              Trending GIFs
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_GIFS.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => onSendGif?.(gif.url)}
                  title={gif.title}
                  className="rounded-xl overflow-hidden bg-[#333333] hover:scale-105 transition-transform aspect-video flex items-center justify-center cursor-pointer border border-[#3e3e3e]"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

