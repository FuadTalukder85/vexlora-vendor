import React from "react";

const DEFAULT_QUICK_REPLIES = [
  "Hello! Thank you for reaching out to our store. How can I help you today?",
  "Yes! This item is currently in stock and ready for same-day dispatch.",
  "Your order is currently being inspected and packed carefully.",
  "Let me check the exact shipping details for you right away.",
];

interface QuickRepliesProps {
  replies?: string[];
  onSelectReply: (reply: string) => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies = DEFAULT_QUICK_REPLIES,
  onSelectReply,
}) => {
  return (
    <div className="px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 bg-neutral-100/60 border-t border-neutral-200">
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
        Quick Replies:
      </span>
      {replies.map((reply, idx) => (
        <button
          key={idx}
          onClick={() => onSelectReply(reply)}
          className="px-3 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-amber-100 text-neutral-700 hover:text-amber-900 border border-neutral-200 shrink-0 transition-colors cursor-pointer"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};
