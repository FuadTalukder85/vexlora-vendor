import React from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { Conversation } from "@/lib/api/chat";

interface ChatContextBannerProps {
  conversation: Conversation;
}

export const ChatContextBanner: React.FC<ChatContextBannerProps> = ({ conversation }) => {
  return (
    <>
      {conversation.product && (
        <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-neutral-200 shrink-0">
              <Image
                src={conversation.product.images?.[0] || "/images/placeholder.png"}
                alt={conversation.product.title}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-semibold text-neutral-900 truncate max-w-sm">
              {conversation.product.title}
            </span>
          </div>
          <span className="font-bold text-neutral-900">
            ${Number(conversation.product.discountPrice ?? conversation.product.basePrice).toFixed(2)}
          </span>
        </div>
      )}

      {conversation.subOrder && (
        <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-1.5 font-semibold">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>Sub-Order #{conversation.subOrder.id.substring(0, 10)}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
            Status: {conversation.subOrder.status}
          </span>
        </div>
      )}
    </>
  );
};
