const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ||
  (API_BASE.startsWith("https://")
    ? API_BASE.replace(/^https:\/\//, "wss://")
    : API_BASE.replace(/^http:\/\//, "ws://"));

export interface User {
  id: string;
  username: string;
  phone?: string | null;
  display_name: string;
  avatar_color: string;
  initials: string;
  avatar_url?: string | null;
  is_online?: boolean;
  last_seen?: string | null;
  is_admin?: boolean;
}

export interface MessageSender {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  initials: string;
  avatar_url?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string; // 'text' | 'image' | 'file' | 'system'
  status: "sending" | "sent" | "delivered" | "read";
  created_at: string;
  sender?: MessageSender;
  // Client-side enhancements
  reply_to?: {
    id: string;
    sender_name: string;
    content: string;
  };
  reactions?: Record<string, string[]>; // emoji -> list of user_ids
  is_edited?: boolean;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  group_name?: string | null;
  group_avatar_color?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  members: User[];
  last_message?: Message | null;
  unread_count: number;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("signal_token");
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("signal_token", token);
  } else {
    localStorage.removeItem("signal_token");
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An error occurred";
    try {
      const err = await response.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(data: {
    username: string;
    phone: string;
    display_name: string;
    password: string;
  }): Promise<{ token: string; user: User }> {
    return request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: {
    username: string;
    password: string;
  }): Promise<{ token: string; user: User }> {
    return request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<User> {
    return request<User>("/api/auth/me");
  },

  async verifyOtp(data: { phone: string; otp: string }): Promise<{ verified: boolean }> {
    return request<{ verified: boolean }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Contacts
  async getContacts(): Promise<User[]> {
    return request<User[]>("/api/contacts");
  },

  async addContact(data: { username?: string; phone?: string }): Promise<User> {
    return request<User>("/api/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async removeContact(contact_user_id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/contacts/${contact_user_id}`, {
      method: "DELETE",
    });
  },

  async searchUsers(q: string): Promise<User[]> {
    return request<User[]>(`/api/users/search?q=${encodeURIComponent(q)}`);
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return request<Conversation[]>("/api/conversations");
  },

  async getConversation(id: string): Promise<Conversation> {
    return request<Conversation>(`/api/conversations/${id}`);
  },

  async createDirectConversation(user_id: string): Promise<Conversation> {
    return request<Conversation>("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ user_id }),
    });
  },

  async createGroup(data: { name: string; member_ids: string[] }): Promise<Conversation> {
    return request<Conversation>("/api/conversations/group", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateGroup(id: string, data: { name: string }): Promise<Conversation> {
    return request<Conversation>(`/api/conversations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async addGroupMember(conversation_id: string, user_id: string): Promise<Conversation> {
    return request<Conversation>(`/api/conversations/${conversation_id}/members`, {
      method: "POST",
      body: JSON.stringify({ user_id }),
    });
  },

  async removeGroupMember(conversation_id: string, user_id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/conversations/${conversation_id}/members/${user_id}`, {
      method: "DELETE",
    });
  },

  // Messages
  async getMessages(conversation_id: string, limit = 50, before?: string): Promise<Message[]> {
    let url = `/api/conversations/${conversation_id}/messages?limit=${limit}`;
    if (before) url += `&before=${encodeURIComponent(before)}`;
    return request<Message[]>(url);
  },

  async sendMessage(
    conversation_id: string,
    content: string,
    message_type = "text"
  ): Promise<Message> {
    return request<Message>(`/api/conversations/${conversation_id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, message_type }),
    });
  },

  async markMessageAsRead(conversation_id: string, message_id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/conversations/${conversation_id}/messages/${message_id}/read`, {
      method: "PUT",
    });
  },

  async markConversationAsRead(conversation_id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/conversations/${conversation_id}/read`, {
      method: "PUT",
    });
  },

  async searchMessages(
    q: string,
    options?: { conversation_id?: string; contact_id?: string }
  ): Promise<MessageSearchResult[]> {
    let url = `/api/messages/search?q=${encodeURIComponent(q)}`;
    if (options?.conversation_id) {
      url += `&conversation_id=${encodeURIComponent(options.conversation_id)}`;
    }
    if (options?.contact_id) {
      url += `&contact_id=${encodeURIComponent(options.contact_id)}`;
    }
    return request<MessageSearchResult[]>(url);
  },
};

export interface MessageSearchResult extends Message {
  is_group?: boolean;
  group_name?: string | null;
}

