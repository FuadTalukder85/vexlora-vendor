"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { vendorChatApi, Conversation, ChatMessage } from "@/lib/api/chat";
import { getVendorSocket } from "@/lib/socket";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Package,
  ShoppingBag,
  Clock,
  Sparkles,
  CheckCheck,
  Building2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const QUICK_REPLIES = [
  "Hello! Thank you for reaching out to our store. How can I help you today?",
  "Yes! This item is currently in stock and ready for same-day dispatch.",
  "Your order is currently being inspected and packed carefully.",
  "Let me check the exact shipping details for you right away.",
];

export default function VendorMessagesPage() {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await vendorChatApi.getConversations();
      setConversations(data);
    } catch (err) {
      toast.error("Failed to load customer messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket listener setup
  useEffect(() => {
    const socket = getVendorSocket();

    const handleNewMessage = (payload: { conversationId: string; message: ChatMessage }) => {
      if (activeConversation && activeConversation.id === payload.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
        vendorChatApi.markAsRead(payload.conversationId).catch(() => {});
      } else {
        fetchConversations();
      }
    };

    const handleNotification = (payload: { conversationId: string; senderName: string; text: string }) => {
      toast.info(`New message from ${payload.senderName}: "${payload.text}"`);
      fetchConversations();
    };

    const handleTyping = (payload: { conversationId: string; userName: string; isTyping: boolean }) => {
      if (activeConversation && activeConversation.id === payload.conversationId) {
        setIsTyping(payload.isTyping);
        setTypingUser(payload.isTyping ? payload.userName : null);
      }
    };

    socket.on("NEW_CHAT_MESSAGE", handleNewMessage);
    socket.on("NEW_CHAT_NOTIFICATION", handleNotification);
    socket.on("USER_TYPING", handleTyping);

    return () => {
      socket.off("NEW_CHAT_MESSAGE", handleNewMessage);
      socket.off("NEW_CHAT_NOTIFICATION", handleNotification);
      socket.off("USER_TYPING", handleTyping);
    };
  }, [activeConversation]);

  // Load active conversation messages
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
      } catch {
        toast.error("Failed to load conversation history");
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");

      const socket = getVendorSocket();
      socket.emit("typing_stop", { conversationId: activeConversation.id });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.customer?.name?.toLowerCase().includes(query) ||
      c.customer?.email?.toLowerCase().includes(query) ||
      c.product?.title?.toLowerCase().includes(query) ||
      c.subOrder?.order?.orderNumber?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-500" /> Customer Inquiries & Live Chat
          </h1>
          <p className="text-xs text-neutral-500">
            Real-time direct communication with buyers about products, stock inquiries, and order delivery.
          </p>
        </div>

        <button
          onClick={fetchConversations}
          className="px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* Left Column: Inbox List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col shrink-0 bg-neutral-50/50">
          {/* Search Box */}
          <div className="p-4 border-b border-neutral-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, orders, products..."
                className="w-full pl-10 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                <p className="text-xs font-semibold text-neutral-700">No customer inquiries</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  When customers send inquiries on your products or orders, they will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                const unread = conv.unreadCountVendor || 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                      isActive ? "bg-amber-500/10 border-l-4 border-amber-500" : "hover:bg-neutral-100/70"
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                      {conv.customer?.image ? (
                        <Image
                          src={conv.customer.image}
                          alt={conv.customer.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-700">
                          {conv.customer?.name?.[0] || "C"}
                        </div>
                      )}
                      {unread > 0 && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {conv.customer?.name || "Customer"}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {conv.product && (
                        <p className="text-[11px] font-semibold text-amber-700 truncate flex items-center gap-1 mb-0.5">
                          <ShoppingBag className="w-3 h-3 shrink-0" />
                          {conv.product.title}
                        </p>
                      )}

                      {conv.subOrder?.order && (
                        <p className="text-[11px] font-semibold text-blue-700 truncate flex items-center gap-1 mb-0.5">
                          <Package className="w-3 h-3 shrink-0" />
                          Order #{conv.subOrder.order.orderNumber}
                        </p>
                      )}

                      <p className="text-xs text-neutral-500 truncate">
                        {conv.lastMessage || "Started conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 relative shrink-0">
                  {activeConversation.customer?.image ? (
                    <Image
                      src={activeConversation.customer.image}
                      alt={activeConversation.customer.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-700">
                      {activeConversation.customer?.name?.[0] || "C"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {activeConversation.customer?.name || "Customer"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {activeConversation.customer?.email}
                  </p>
                </div>
              </div>

              {/* Context Action Badges */}
              <div className="flex items-center gap-2">
                {activeConversation.subOrder && (
                  <Link
                    href={`/orders/${activeConversation.subOrder.id}`}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Order</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {activeConversation.product && (
                  <Link
                    href={`/products/${activeConversation.product.id}`}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Product Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Context Banners */}
            {activeConversation.product && (
              <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-neutral-200 shrink-0">
                    <Image
                      src={activeConversation.product.images?.[0] || "/images/placeholder.png"}
                      alt={activeConversation.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold text-neutral-900 truncate max-w-sm">
                    {activeConversation.product.title}
                  </span>
                </div>
                <span className="font-bold text-neutral-900">
                  ${Number(activeConversation.product.discountPrice ?? activeConversation.product.basePrice).toFixed(2)}
                </span>
              </div>
            )}

            {activeConversation.subOrder && (
              <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sub-Order #{activeConversation.subOrder.id.substring(0, 10)}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
                  Status: {activeConversation.subOrder.status}
                </span>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/40">
              {messagesLoading ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-neutral-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-500/60" />
                  <p className="text-xs font-semibold text-neutral-700">No messages yet</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Reply to the customer using the input bar below.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isVendor = msg.senderRole === "VENDOR";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isVendor ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[78%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isVendor
                            ? "bg-neutral-900 text-white rounded-br-xs"
                            : "bg-white text-neutral-900 border border-neutral-200/80 rounded-bl-xs shadow-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 px-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isVendor && <CheckCheck className="w-3 h-3 text-neutral-400" />}
                      </span>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 italic bg-white border border-neutral-200 px-3.5 py-2 rounded-2xl w-fit animate-pulse">
                  <span>{typingUser || "Customer"} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Bar */}
            <div className="px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 bg-neutral-100/60 border-t border-neutral-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
                Quick Replies:
              </span>
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  className="px-3 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-amber-100 text-neutral-700 hover:text-amber-900 border border-neutral-200 shrink-0 transition-colors cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-neutral-200 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your response to the customer..."
                className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || sending}
                className="px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-amber-500 text-white hover:text-black font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:text-white shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-12 text-center bg-neutral-50/30">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Select a Customer Conversation</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Choose an inquiry from the left inbox to view message history, attached products, and order context.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
