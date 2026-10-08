"use client";

import React from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { useVendorChat } from "@/hooks/useVendorChat";
import { ConversationList } from "./components/ConversationList";
import { ChatHeader } from "./components/ChatHeader";
import { ChatContextBanner } from "./components/ChatContextBanner";
import { MessageList } from "./components/MessageList";
import { QuickReplies } from "./components/QuickReplies";
import { ChatInput } from "./components/ChatInput";

export default function VendorMessagesPage() {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    messagesLoading,
    inputText,
    sending,
    searchQuery,
    setSearchQuery,
    isTyping,
    typingUser,
    messagesContainerRef,
    fetchConversations,
    handleInputChange,
    handleSendMessage,
  } = useVendorChat();

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
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={(conv) => setActiveConversation(conv)}
        />

        {/* Right Column: Chat Window */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            <ChatHeader conversation={activeConversation} />
            <ChatContextBanner conversation={activeConversation} />
            <MessageList
              messages={messages}
              loading={messagesLoading}
              isTyping={isTyping}
              typingUser={typingUser}
              messagesContainerRef={messagesContainerRef}
            />
            <QuickReplies onSelectReply={handleSendMessage} />
            <ChatInput
              inputText={inputText}
              sending={sending}
              onInputChange={handleInputChange}
              onSendMessage={() => handleSendMessage()}
            />
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
