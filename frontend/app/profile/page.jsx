'use client';

import React, { useState } from 'react';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import CustomInput from '@/components/common/CustomInput';
import { FaUserEdit, FaSave } from "react-icons/fa";
import { useSelector } from 'react-redux';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';

const Profile = () => {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [link, setLink] = useState('https://example.com');
  const [bio, setBio] = useState('Frontend Developer');
  
  const userdata = useSelector((state) => state.chat.userdata);
  const user = useSelector((state) => state.chat.user);
  const names= useSelector((state) => state.chat.name);
  const handleEditToggle = () => {
    setEditMode(!editMode);
  };
  console.log(userdata)
  const photoURL = userdata?.photoURL   || 'https://img.freepik.com/free-psd/abstract-background-design_1297-75.jpg?w=1060&t=st=1723186219~exp=1723186819~hmac=788b74d69097f6551006599dae26ad0dc3d51a2845e9f452e3f926b2f229286a';
  const displayName = userdata?.displayName || names;
  const Email = user
  
  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500"
      >
        <div className="container mx-auto px-4 py-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="mb-6 flex items-center text-white"
          >
            <MdKeyboardArrowLeft size={24} />
            <span className="ml-2">Back</span>
          </motion.button>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEditToggle}
                className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center"
              >
                {editMode ? <FaSave className="mr-2" /> : <FaUserEdit className="mr-2" />}
                {editMode ? 'Save' : 'Edit'}
              </motion.button>
            </div>
            
            <div className="flex flex-col md:flex-row">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-8"
              />
              <div className="flex-grow">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{displayName}</h2>
                <p className="text-gray-600 mb-4">@{Email}</p>
                
                <CustomInput
                  label="Name"
                  value={name? name : displayName}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editMode}
                  inputType="text"
                />
                <CustomInput
                  label="Email"
                  value={email ? email : Email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editMode}
                  inputType="email"
                />
                <CustomInput
                  label="Website"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  disabled={!editMode}
                  inputType="text"
                />
                <CustomInput
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!editMode}
                  inputType="text"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default Profile;