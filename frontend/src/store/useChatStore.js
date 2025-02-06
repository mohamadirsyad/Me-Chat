import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axiosInstance";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  editMessage: async (messageId, newContent) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, {
        content: newContent,
      });

      // Update state lokal
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? { ...msg, content: res.data.content } : msg
        ),
      });

      // Emit event editMessage ke socket agar update ke semua user
      const socket = useAuthStore.getState().socket;
      socket.emit("editMessage", { ...res.data, _id: messageId });

      toast.success("Message updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);

      // Update state lokal
      set({ messages: get().messages.filter((msg) => msg._id !== messageId) });

      // Emit event deleteMessage ke socket agar update ke semua user
      const socket = useAuthStore.getState().socket;
      socket.emit("deleteMessage", messageId);

      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });

    // Realtime Edit Message
    socket.on("editMessage", (updatedMessage) => {
      set({
        messages: get().messages.map((msg) =>
          msg._id === updatedMessage._id
            ? { ...msg, content: updatedMessage.content }
            : msg
        ),
      });
    });

    // Realtime Delete Message
    socket.on("deleteMessage", (messageId) => {
      set({ messages: get().messages.filter((msg) => msg._id !== messageId) });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("editMessage");
    socket.off("deleteMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
