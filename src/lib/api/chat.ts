import { apiClient } from "../api-client";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "CUSTOMER" | "VENDOR" | "ADMIN";
  text: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
}

export interface Conversation {
  id: string;
  customerId: string;
  vendorId: string;
  productId?: string | null;
  subOrderId?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCountCustomer: number;
  unreadCountVendor: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  vendor?: {
    id: string;
    storeName: string;
    storeSlug: string;
    storeLogo?: string | null;
    ratingAvg: number | string;
  };
  product?: {
    id: string;
    title: string;
    slug: string;
    images: string[];
    basePrice: number | string;
    discountPrice?: number | string | null;
  } | null;
  subOrder?: {
    id: string;
    status: string;
    trackingNumber?: string | null;
    subtotal: number | string;
    order?: {
      id: string;
      orderNumber: string;
    };
  } | null;
  messages?: ChatMessage[];
}

export const vendorChatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const res = await apiClient.get<{ data: Conversation[] }>("/chats");
    return res.data?.data || [];
  },

  getConversationById: async (id: string): Promise<Conversation> => {
    const res = await apiClient.get<{ data: Conversation }>(`/chats/${id}`);
    return res.data?.data;
  },

  getMessages: async (id: string, page = 1, limit = 50): Promise<ChatMessage[]> => {
    const res = await apiClient.get<{ data: ChatMessage[] }>(`/chats/${id}/messages`, {
      params: { page, limit },
    });
    return res.data?.data || [];
  },

  sendMessage: async (id: string, text: string, attachments?: string[]): Promise<ChatMessage> => {
    const res = await apiClient.post<{ data: ChatMessage }>(`/chats/${id}/messages`, {
      text,
      attachments,
    });
    return res.data?.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/chats/${id}/read`);
  },
};
