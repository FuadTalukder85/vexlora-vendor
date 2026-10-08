import React from "react";
import Image from "next/image";
import { MessageSquare, Search, ShoppingBag, Package } from "lucide-react";
import { Conversation } from "@/lib/api/chat";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  loading,
  searchQuery,
  onSearchChange,
  onSelectConversation,
}) => {
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
    <div className="w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col shrink-0 bg-neutral-50/50">
      {/* Search Box */}
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
                onClick={() => onSelectConversation(conv)}
                className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                  isActive
                    ? "bg-amber-500/15 border-l-4 border-amber-500"
                    : unread > 0
                    ? "bg-amber-50/80 hover:bg-amber-100/60 border-l-4 border-amber-500"
                    : "hover:bg-neutral-100/70"
                }`}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                  {conv.customer?.image ? (
                    <Image
                      src={conv.customer.image}
                      alt={conv.customer.name || "Customer"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-700">
                      {conv.customer?.name?.[0] || "C"}
                    </div>
                  )}
                  {unread > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-xs truncate ${unread > 0 ? "font-black text-neutral-900" : "font-bold text-neutral-800"}`}>
                      {conv.customer?.name || "Customer"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {conv.lastMessageAt && (
                        <span className={`text-[10px] ${unread > 0 ? "font-bold text-amber-700" : "text-neutral-400"}`}>
                          {new Date(conv.lastMessageAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      {unread > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-500 text-white rounded-full min-w-4 text-center">
                          {unread}
                        </span>
                      )}
                    </div>
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

                  <p className={`text-xs truncate ${unread > 0 ? "font-bold text-neutral-900" : "text-neutral-500"}`}>
                    {conv.lastMessage || "Started conversation"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
