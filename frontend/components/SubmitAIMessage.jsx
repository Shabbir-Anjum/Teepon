import React, { useState } from "react";
import { motion } from "framer-motion";
import { sendAiMessage } from "@/API/Api";
import toast, { Toaster } from 'react-hot-toast';
import Recommendation from "@/components/Recommendation/Recommendation";
import { IoMdClose } from "react-icons/io"; 
const Loader = () => (
  <motion.div
    className="flex justify-center items-center h-24"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

const SubmitAIMessage = ({ currentRoom, currentuser, serverUrl, setShowSubmitAIMessage }) => {
  const [outing_topic, setOutingName] = useState("");
  const [location, setAddress] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [AiResponse, setAiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await sendAiMessage(currentRoom, {
        outing_topic: outing_topic,
        location: location,
        send_from: currentuser,
      });
      setOutingName("");
      setAddress("");
      setAiResponse(response);
      toast.success("Received recommendation successfully!");
      setShowRecommendation(true);
    } catch (error) {
      console.error("Error submitting AI message:", error);
      toast.error("Only the outing creator can send a request.");
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowSubmitAIMessage(false);
  };

  return (
   <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <IoMdClose size={24} />
        </button>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Plan Your Outing</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="Enter outing name"
                value={outing_topic}
                onChange={(e) => setOutingName(e.target.value)}
              />
            </motion.div>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="Enter address (City, Country)"
                value={location}
                onChange={(e) => setAddress(e.target.value)}
              />
            </motion.div>
            <motion.button
              type="submit"
              className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Recommendations
            </motion.button>
          </form>
        </div>
        {isLoading && <Loader />}
        {showRecommendation && <Recommendation AiResponse={AiResponse} />}
      </div>
      <Toaster position="top-right" />
    </motion.div>
  );
};

export default SubmitAIMessage;
