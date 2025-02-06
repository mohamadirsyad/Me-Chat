import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { FiTrash2 } from "react-icons/fi"; // Icon edit & delete

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    // editMessage,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [activeMessage, setActiveMessage] = useState(null); // State untuk bubble yang diklik

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // const handleEdit = (message) => {
  //   const updatedData = { text: prompt("Edit message:", message.text) };
  //   if (updatedData.text) {
  //     editMessage(message._id, updatedData);
  //   }
  // };

  const handleDelete = (messageId) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessage(messageId);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.senderId === authUser._id
                ? "justify-end"
                : "justify-start"
            }`}
            ref={messageEndRef}
          >
            <div
              className={`relative chat-bubble max-w-[75%] sm:max-w-[65%] lg:max-w-[50%] py-3 px-4 rounded-2xl shadow-md mb-2 cursor-pointer transition duration-200 ${
                message.senderId === authUser._id
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content"
              }`}
              onClick={() =>
                setActiveMessage(
                  activeMessage === message._id ? null : message._id
                )
              } // Toggle aktif/tidak
            >
              {/* Tombol Edit & Delete hanya muncul saat bubble diklik */}
              {message.senderId === authUser._id &&
                activeMessage === message._id && (
                  <div className="absolute -top-3 right-2 flex space-x-2 bg-white/80 rounded-full p-1 shadow-md">
                    {/* <button
                      onClick={() => handleEdit(message)}
                      className="text-gray-500 hover:text-blue-500 text-xs p-1"
                    >
                      <FiEdit2 />
                    </button> */}
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="text-gray-500 hover:text-red-500 text-xs p-1"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}

              {/* Menampilkan Gambar jika ada */}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="rounded-md max-w-full mb-2"
                />
              )}

              {/* Menampilkan teks di bawah gambar */}
              {message.text && <p className="text-sm pr-10">{message.text}</p>}

              {/* Waktu pesan */}
              <p className="text-[10px] mt-1.5 text-right opacity-70">
                {formatMessageTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
