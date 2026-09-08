export const AVATAR_COLORS = [
  "#edd0c9", "#c9d5ed", "#c9edda", "#edd9c9",
  "#d9c9ed", "#edc9c9", "#c9ede8", "#e8edc9",
];

export function getAvatarTextColor(bgColor?: string | null): string {
  if (!bgColor) return "#7b2219";
  const hex = bgColor.toLowerCase();
  if (hex.includes("edd0c9") || hex.includes("f2d6d0") || hex.includes("edc9c9")) return "#7b2219";
  if (hex.includes("c9d5ed") || hex.includes("d5e2fa")) return "#1b3b70";
  if (hex.includes("c9edda") || hex.includes("d4fae2")) return "#1b5e34";
  if (hex.includes("d9c9ed") || hex.includes("ebd8fa")) return "#4a2278";
  if (hex.includes("c9ede8") || hex.includes("d5faf5")) return "#13544d";
  if (hex.includes("e8edc9") || hex.includes("f3fad5")) return "#505719";
  if (hex.includes("edd9c9") || hex.includes("fae5d5")) return "#783c18";
  return "#7b2219";
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function parseDate(isoString?: string): Date | null {
  if (!isoString) return null;
  let normalized = isoString.trim();
  // If the ISO string lacks timezone information (no Z and no offset),
  // append "Z" so JavaScript parses it as UTC instead of local time.
  if (
    !normalized.endsWith("Z") &&
    !normalized.includes("+") &&
    !normalized.slice(10).includes("-")
  ) {
    normalized += "Z";
  }
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
}

export function formatTime(isoString?: string): string {
  const date = parseDate(isoString);
  if (!date) return "";
  try {
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } else if (isYesterday) {
      return "Yesterday";
    } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  } catch {
    return "";
  }
}

export function formatConversationTimestamp(isoString?: string): string {
  const date = parseDate(isoString);
  if (!date) return "";
  try {
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());

    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) {
      return "Now"; // Signal displays "Now" for newly sent/received messages
    }
    if (diffMins < 60) {
      return `${diffMins}m`;
    }

    const diffHours = Math.floor(diffMins / 60);
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (diffHours < 24 && isToday) {
      return `${diffHours}h`;
    }

    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    return date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "2-digit" });
  } catch {
    return "";
  }
}

export function formatMessageTimestamp(isoString?: string): string {
  const date = parseDate(isoString);
  if (!date) return "";
  try {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
  } catch {
    return "";
  }
}

export function formatFullTime(isoString?: string): string {
  const date = parseDate(isoString);
  if (!date) return "";
  try {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function formatDateSeparator(isoString?: string): string {
  const date = parseDate(isoString);
  if (!date) return "";
  try {
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

