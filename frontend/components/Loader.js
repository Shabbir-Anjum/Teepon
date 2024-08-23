import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 overflow-hidden">
      <div className="relative">
       
        <motion.div
          className="absolute inset-0 bg-white rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotating outer ring */}
        <motion.div
          className="w-32 h-32 border-4 border-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Rocket icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-white"
          animate={{
            rotate: [0, 0, 180, 180, 0],
            scale: [1, 0.8, 0.8, 1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FaRocket size={32} />
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.p
        className="absolute mt-16 ml-1 text-white text-xl font-semibold"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Loading...
      </motion.p>
    </div>
  );
}