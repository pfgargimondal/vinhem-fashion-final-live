import { useChat } from "../../../context/ChatContext"; // adjust path if needed
import { ChatProfileDetails } from "./ChatProfileDetails";

const GlobalChat = () => {
  const { chatProfileDetailsShow, setChatProfileDetailsShow } = useChat();

  return (
    <>
      {/* Floating Chat Button */}
      {!chatProfileDetailsShow && (
        <div
          className="dkwejkrhiwenrower position-fixed"
          onClick={() => setChatProfileDetailsShow(true)}
        >
          <i className="bi text-white position-absolute bi-chat-dots-fill"></i>
        </div>
      )}

      {/* Chat Window */}
      {chatProfileDetailsShow && (
        <ChatProfileDetails
          setChatProfileDetailsShow={setChatProfileDetailsShow}
        />
      )}
    </>
  );
};

export default GlobalChat;