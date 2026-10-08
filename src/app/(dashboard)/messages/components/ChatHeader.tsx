import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Conversation } from "@/lib/api/chat";

interface ChatHeaderProps {
  conversation: Conversation;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  return (
    <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 relative shrink-0">
          {conversation.customer?.image ? (
            <Image
              src={conversation.customer.image}
              alt={conversation.customer.name || "Customer"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-700">
              {conversation.customer?.name?.[0] || "C"}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900">
            {conversation.customer?.name || "Customer"}
          </h3>
          <p className="text-xs text-neutral-500">
            {conversation.customer?.email}
          </p>
        </div>
      </div>

      {/* Context Action Badges */}
      <div className="flex items-center gap-2">
        {conversation.subOrder && (
          <Link
            href={`/orders/${conversation.subOrder.id}`}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>View Order</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
        {conversation.product && (
          <Link
            href={`/products/${conversation.product.id}`}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Product Details</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
};
