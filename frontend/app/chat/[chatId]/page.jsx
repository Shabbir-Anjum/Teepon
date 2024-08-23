'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  connectSocket,
  disconnectSocket,
  sendMessage,
  joinRoom,
} from "@/services/socketService";
import { setCurrentMessages, setCurrentRoom } from "@/store/ChatSlice";
import { IoSend } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";
import { RiRobotFill } from "react-icons/ri"; // Changed to a more modern robot icon
import { GiHamburgerMenu } from "react-icons/gi";
import ChatWindow from "@/components/ChatWindow";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatLayout from "@/components/ChatLayout";
import SubmitAIMessage from "@/components/SubmitAIMessage";
import { motion } from 'framer-motion';

const ChatRoom = () => {
  const [messageInput, setMessageInput] = useState("");
  const [showSubmitAIMessage, setShowSubmitAIMessage] = useState(false);
  const router = useRouter();
  const messages = useSelector((state) => state.chat.messages);
  const currentRoom = useSelector((state) => state.chat.currentRoom);
  const RoomName = useSelector((state) => state.chat.RoomName);
  const dispatch = useDispatch();
  const currentuser = useSelector((state) => state.chat.user);
  const serverUrl = useSelector((state) => state.chat.server_url);

  useEffect(() => {
    connectSocket();
    if (currentRoom) {
      handleJoin(currentRoom);
    }

    const storedMessages = JSON.parse(localStorage.getItem("chatMessages"));
    if (storedMessages) {
      dispatch(setCurrentMessages(storedMessages));
    }

    return () => {
      disconnectSocket();
    };
  }, [currentRoom]);

  const handleJoin = (currentRoom) => {
    joinRoom(currentRoom);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const datetime = new Date().toGMTString();
    sendMessage(messageInput, currentRoom, currentuser, datetime);

    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/get-outings/${currentRoom}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/9.2.0'
      },
      body: JSON.stringify({
        content: messageInput,
        send_from: currentuser,
      }),
    });
    setMessageInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };


  return (
    <ProtectedRoute>
      <ChatLayout>
        {currentRoom && (
          <div className="flex flex-col h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <header className="bg-white bg-opacity-10 backdrop-blur-lg text-white p-4 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-4">

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-blue-300 transition-colors duration-200 ml-7 mt-1"
                  onClick={() => { router.push('/chat'); }}
                >
                  <FaArrowLeft size={20} />
                </motion.button>
                <h2 className="text-xl font-semibold">{RoomName}</h2>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2 cursor-pointer text-white hover:text-blue-300 transition-colors duration-200"
                onClick={() => { setShowSubmitAIMessage(!showSubmitAIMessage); }}
              >
                <RiRobotFill size={28} />
                <span className="hidden md:inline">Get AI Recommendations</span>
              </motion.div>
            </header>

            <main className="flex-1 overflow-y-auto bg-white bg-opacity-10 backdrop-blur-md p-4 relative">
              {showSubmitAIMessage && (
                <SubmitAIMessage
                  currentRoom={currentRoom}
                  currentuser={currentuser}
                  serverUrl={serverUrl}
                  setShowSubmitAIMessage={setShowSubmitAIMessage}
                />
              )}
              <ChatWindow messages={messages} />

              {!showSubmitAIMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className=" fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-full px-4 py-2 shadow-lg cursor-pointer z-10"
                  onClick={() => setShowSubmitAIMessage(true)}
                >
                  <div className="flex items-center gap-2 text-purple-600">
                    <RiRobotFill size={20} />
                    <span className="text-sm font-medium">Ask AI for outing ideas</span>
                  </div>
                </motion.div>
              )}
            </main>

            <footer className="p-4 bg-white bg-opacity-10 backdrop-blur-lg">
              <div className="flex items-center bg-white bg-opacity-20 rounded-full overflow-hidden shadow-lg">
                <input
                  className="flex-1 p-3 bg-transparent text-white placeholder-gray-300 focus:outline-none"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-purple-600 rounded-full mr-1"
                  onClick={handleSubmit}
                >
                  <IoSend />
                </motion.button>
              </div>
            </footer>
          </div>
        )}
      </ChatLayout>
    </ProtectedRoute>
  );
};

export default ChatRoom;