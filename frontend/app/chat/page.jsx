'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatLayout from '@/components/ChatLayout';
import { motion } from 'framer-motion';

const ChatIndex = () => {
  return (
    <ProtectedRoute>
      <ChatLayout>
        
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-lg"
          >
            <motion.h1 
              className="text-3xl font-bold text-white mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Welcome to the Chat
            </motion.h1>
            <motion.p 
              className="text-xl text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Please select a room from the sidebar to start chatting.
            </motion.p>
          </motion.div>
        </div>
      </ChatLayout>
    </ProtectedRoute>
  );
};

export default ChatIndex;