import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-2 sm:p-3 w-full border-t ">
      {/* Preview Gambar */}
      {imagePreview && (
        <div className="mb-2 sm:mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-500"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-700 text-white
              flex items-center justify-center hover:bg-red-500 transition"
              type="button"
            >
              <X className="size-3 sm:size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 w-full rounded-full px-3 py-2 sm:bg-transparent sm:rounded-none sm:p-0"
      >
        {/* Input Chat dengan Tombol di Dalamnya untuk Mobile */}
        <div className="flex-1 flex items-center  px-3 py-1 rounded-full sm:rounded-none input sm:input sm:input-bordered input-bordered sm:border-none w-full">
          <input
            type="text"
            className="w-full text-sm sm:text-base px-2 py-1 outline-none bg-transparent"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Tombol Upload Gambar (Hanya Muncul di Mobile) */}
          <button
            type="button"
            className="text-gray-500 sm:hidden mr-2" // Tambahkan margin kanan
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          {/* Tombol Kirim Pesan (Hanya Muncul di Mobile) */}
          <button
            type="submit"
            className={`sm:hidden ${
              text.trim() || imagePreview
                ? "text-blue-500"
                : "text-gray-400 cursor-not-allowed"
            }`}
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Tombol di Layar Lebih Besar */}
        <button
          type="button"
          className="hidden sm:flex btn btn-circle"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={22} />
        </button>

        <button
          type="submit"
          className="hidden sm:flex btn btn-circle bg-blue-500 text-white hover:bg-blue-600 transition disabled:bg-gray-700 disabled:cursor-not-allowed"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
