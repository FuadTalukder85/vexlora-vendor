import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { vendorChatApi, Conversation, ChatMessage } from "@/lib/api/chat";
import { getVendorSocket } from "@/lib/socket";

export function useVendorChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorChatApi.getConversations();
      const activeId = activeConversation?.id;
      const normalizedData = data.map((c) =>
        activeId && c.id === activeId ? { ...c, unreadCountVendor: 0 } : c
      );
      setConversations(normalizedData);
    } catch {
      toast.error("Failed to load customer messages");
    } finally {
      setLoading(false);
    }
  }, [activeConversation?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time Socket.IO listeners
  useEffect(() => {
    const socket = getVendorSocket();

    const handleNewMessage = (payload: { conversationId: string; message: ChatMessage }) => {
      if (activeConversation && activeConversation.id === payload.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === payload.conversationId
              ? {
                  ...c,
                  lastMessage: payload.message.text,
                  lastMessageAt: payload.message.createdAt,
                  unreadCountVendor: 0,
                }
              : c
          )
        );
        if (payload.message.senderRole !== "VENDOR") {
          socket.emit("message_delivered", { conversationId: payload.conversationId });
          vendorChatApi.markAsRead(payload.conversationId).catch(() => {});
        }
      } else {
        if (payload.message.senderRole !== "VENDOR") {
          socket.emit("message_delivered", { conversationId: payload.conversationId });
        }
        setConversations((prev) =>
          prev.map((c) =>
            c.id === payload.conversationId
              ? {
                  ...c,
                  lastMessage: payload.message.text,
                  lastMessageAt: payload.message.createdAt,
                  unreadCountVendor: (c.unreadCountVendor || 0) + 1,
                }
              : c
          )
        );
        fetchConversations();
      }
    };

    const handleNotification = (payload: { conversationId: string; senderName: string; text: string }) => {
      if (activeConversation && activeConversation.id === payload.conversationId) {
        return;
      }
      toast.info(`New message from ${payload.senderName}: "${payload.text}"`);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                lastMessage: payload.text,
                lastMessageAt: new Date().toISOString(),
                unreadCountVendor: (c.unreadCountVendor || 0) + 1,
              }
            : c
        )
      );
      fetchConversations();
    };

    const handleTyping = (payload: { conversationId: string; userName: string; isTyping: boolean }) => {
      if (activeConversation && activeConversation.id === payload.conversationId) {
        setIsTyping(payload.isTyping);
        setTypingUser(payload.isTyping ? payload.userName : null);
      }
    };

    const handleMessagesDelivered = (payload: { conversationId: string; deliveredTo: string }) => {
      if (activeConversation && activeConversation.id === payload.conversationId) {
        const isDeliveredToCustomer = payload.deliveredTo === activeConversation.customerId;
        if (isDeliveredToCustomer) {
          setMessages((prev) =>
            prev.map((m) =>
              m.senderRole === "VENDOR"
                ? { ...m, isDelivered: true }
                : m
            )
          );
        }
      }
    };

    const handleMessagesRead = (payload: { conversationId: string; readBy: string }) => {
      if (activeConversation && activeConversation.id === payload.conversationId) {
        const isReadByCustomer = payload.readBy === activeConversation.customerId;
        setMessages((prev) =>
          prev.map((m) => {
            if (isReadByCustomer && m.senderRole === "VENDOR") {
              return { ...m, isRead: true, isDelivered: true };
            }
            if (!isReadByCustomer && m.senderRole !== "VENDOR") {
              return { ...m, isRead: true, isDelivered: true };
            }
            return m;
          })
        );
      }
    };

    socket.on("NEW_CHAT_MESSAGE", handleNewMessage);
    socket.on("NEW_CHAT_NOTIFICATION", handleNotification);
    socket.on("USER_TYPING", handleTyping);
    socket.on("MESSAGES_DELIVERED", handleMessagesDelivered);
    socket.on("MESSAGES_READ", handleMessagesRead);

    return () => {
      socket.off("NEW_CHAT_MESSAGE", handleNewMessage);
      socket.off("NEW_CHAT_NOTIFICATION", handleNotification);
      socket.off("USER_TYPING", handleTyping);
      socket.off("MESSAGES_DELIVERED", handleMessagesDelivered);
      socket.off("MESSAGES_READ", handleMessagesRead);
    };
  }, [activeConversation, fetchConversations]);

  // Load active conversation messages and join conversation room
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const msgs = await vendorChatApi.getMessages(activeConversation.id);
        setMessages(msgs);
        const socket = getVendorSocket();
        socket.emit("join_conversation", activeConversation.id);
        await vendorChatApi.markAsRead(activeConversation.id);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id ? { ...c, unreadCountVendor: 0 } : c
          )
        );
      } catch {
        toast.error("Failed to load conversation history");
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation]);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConversation) return;

    const socket = getVendorSocket();
    socket.emit("typing_start", {
      conversationId: activeConversation.id,
      userName: activeConversation.vendor?.storeName || "Vendor Support",
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId: activeConversation.id });
    }, 1500);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend ?? inputText;
    if (!text.trim() || !activeConversation || sending) return;

    setSending(true);
    try {
      const newMsg = await vendorChatApi.sendMessage(activeConversation.id, text.trim());
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setInputText("");

      const socket = getVendorSocket();
      socket.emit("typing_stop", { conversationId: activeConversation.id });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    messagesLoading,
    inputText,
    setInputText,
    sending,
    searchQuery,
    setSearchQuery,
    isTyping,
    typingUser,
    messagesContainerRef,
    fetchConversations,
    handleInputChange,
    handleSendMessage,
  };
}
