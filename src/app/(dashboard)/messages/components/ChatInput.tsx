import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputText: string;
  sending: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  sending,
  onInputChange,
  onSendMessage,
}) => {
  return (
    <div className="p-4 bg-white border-t border-neutral-200 flex items-center gap-3">
      <input
        type="text"
        value={inputText}
        onChange={onInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
        placeholder="Type your response to the customer..."
        className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />

      <button
        onClick={onSendMessage}
        disabled={!inputText.trim() || sending}
        className="px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-amber-500 text-white hover:text-black font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:text-white shrink-0"
      >
        <span>Send</span>
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};
