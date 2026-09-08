import { WS_BASE, Message, Conversation } from "./api";

export type WebSocketEvent =
  | { type: "new_message"; message: Message }
  | { type: "message_sent"; message: Message }
  | { type: "message_status"; message_id: string; conversation_id?: string; status: string; read_by?: string }
  | { type: "messages_read"; conversation_id: string; read_by: string }
  | { type: "typing"; conversation_id: string; user_id: string; is_typing: boolean }
  | { type: "user_status"; user_id: string; is_online: boolean }
  | { type: "new_conversation"; conversation: Conversation }
  | { type: "conversation_updated"; conversation: Conversation };

type Listener = (event: WebSocketEvent) => void;

class SignalWebSocket {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isIntentionallyClosed = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  public connect(userId: string) {
    if (this.userId === userId && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.userId = userId;
    this.isIntentionallyClosed = false;
    this.cleanup();

    try {
      const url = `${WS_BASE}/ws/${userId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          this.listeners.forEach((listener) => {
            try {
              listener(data);
            } catch (err) {
              console.error("Error in WS listener:", err);
            }
          });
        } catch {
          // Non-JSON message, ignore
        }
      };

      this.ws.onclose = () => {
        this.cleanupHeartbeat();
        if (!this.isIntentionallyClosed && this.userId) {
          this.reconnectTimeout = setTimeout(() => {
            this.connect(this.userId!);
          }, 2000);
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
    }
  }

  public disconnect() {
    this.isIntentionallyClosed = true;
    this.cleanup();
  }

  private cleanupHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private cleanup() {
    this.cleanupHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.close();
      this.ws = null;
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public sendTyping(conversationId: string, isTyping: boolean) {
    this.send({
      type: "typing",
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }

  public sendRead(conversationId: string, messageId: string) {
    this.send({
      type: "read",
      conversation_id: conversationId,
      message_id: messageId,
    });
  }

  public sendActiveConversation(conversationId: string | null) {
    this.send({
      type: "active_conversation",
      conversation_id: conversationId,
    });
  }

  private send(payload: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }
}

export const signalWs = new SignalWebSocket();

