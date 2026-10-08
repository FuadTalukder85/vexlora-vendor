import React from "react";
import { Sparkles, Check, CheckCheck } from "lucide-react";
import { ChatMessage } from "@/lib/api/chat";

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  isTyping: boolean;
  typingUser: string | null;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  isTyping,
  typingUser,
  messagesContainerRef,
}) => {
  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/40">
      {loading ? (
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
                    ? "bg-[#c9e1fa] text-primary rounded-br-xs"
                    : "bg-[#F1F5F9] text-primary border border-neutral-200/80 rounded-bl-xs shadow-xs"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1 flex items-center gap-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {isVendor && (
                  msg.isRead ? (
                    <span className="flex items-center text-sky-500" title="Seen">
                      <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  ) : msg.isDelivered ? (
                    <span className="flex items-center text-neutral-400" title="Delivered">
                      <CheckCheck className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="flex items-center text-neutral-400/60" title="Sent">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )
                )}
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
    </div>
  );
};
