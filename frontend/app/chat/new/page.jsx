'use client';

import ChatLayout from "@/components/ChatLayout";
import React, { useState, useEffect } from "react";
import { AiOutlineUserAdd } from 'react-icons/ai';
import { FaArrowLeft, FaUserFriends, FaCompass } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Page = () => {
  const [name, setName] = useState('');
  const [friendInput, setFriendInput] = useState('');
  const [friends, setFriends] = useState({});
  const userdata = useSelector((state) => state.chat.userdata);

  const email = userdata.email;
  const router = useRouter();

  useEffect(() => {
  }, [friends]);

  const handleAddFriend = () => {
    if (friendInput.trim() !== '') {
      const newFriendId = Object.keys(friends).length + 1;
      setFriends({
        ...friends,
        [newFriendId]: friendInput.trim()
      });
      setFriendInput('');
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await addOuting();
      setName('');
      setFriends({});
      router.push('/chat');
    } catch (error) {
      console.error('Error creating outing:', error);
    }
  };

  const addOuting = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/add-outing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: name, 
          email: email, 
          friend_emails: friends 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add outing');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error adding outing:', error);
      throw error;
    }
  };

  return (
    <ChatLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 p-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-white hover:text-blue-200 pl-6 mb-6"
          onClick={() => { router.push('/chat'); }}
        >
          <FaArrowLeft size={24} />
        </motion.button>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <FaCompass className="mr-3 text-blue-500" />
            Create a new Outing Group
          </h1>

          <motion.input
            whileFocus={{ scale: 1.02 }}
            className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Enter the name of the outing"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="relative flex mb-4">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              className="w-full p-3 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              placeholder="Enter Email of your friends"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-300"
              onClick={handleAddFriend}
            >
              <AiOutlineUserAdd size={24} />
            </motion.button>
          </div>

          {Object.keys(friends).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 bg-gray-100 p-4 rounded-md"
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <FaUserFriends className="mr-2 text-blue-500" />
                Selected Friends:
              </h2>
              <ul className="list-disc list-inside">
                {Object.entries(friends).map(([key, email]) => (
                  <motion.li
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-700"
                  >
                    {email}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600 mt-6 transition duration-300 font-semibold"
            onClick={handleSubmit}
          >
            Create Outing
          </motion.button>
        </motion.div>
      </motion.div>
    </ChatLayout>
  );
};

export default Page;