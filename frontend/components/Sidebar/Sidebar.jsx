// Sidebar.jsx

import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FiSearch, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentRoom,
  setCurrentMessages,
  setRoomName
} from "@/store/ChatSlice";
import { getMessages, listOutings } from "@/API/Api";
import { motion } from "framer-motion";

const Sidebar = ({ hamburg, setHamburg }) => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const serverUrl = useSelector((state) => state.chat.server_url);
  const userdata = useSelector((state) => state.chat.userdata);
  const [outings, setOutings] = useState([]);
  const [error, setError] = useState("");

  const handleRoomClick = async (currentRoom, RoomName) => {
    try {
      const response = await getMessages(currentRoom);
      dispatch(setCurrentMessages(response.messages));
      localStorage.setItem("chatMessages", JSON.stringify(response.messages));
      setHamburg(false);
      dispatch(setCurrentRoom(currentRoom));
      dispatch(setRoomName(RoomName));
      router.push(`/chat/${currentRoom}`);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredOutings = outings.filter((outing) =>
    outing.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  useEffect(() => {
    const fetchUserOutings = async () => {
      try {
        const data = await listOutings(userdata.email); // Use the getOutings function
        setOutings(data.outings);


        setError('');
      } catch (error) {
        console.error('Error fetching outings:', error);
        setError(error.message);
      }
    };

    if (userdata.email) {
      fetchUserOutings();
    }
  }, [userdata, serverUrl]);

  const photoURL = userdata?.photoURL || 'https://img.freepik.com/free-psd/abstract-background-design_1297-75.jpg?w=1060&t=st=1723186219~exp=1723186819~hmac=788b74d69097f6551006599dae26ad0dc3d51a2845e9f452e3f926b2f229286a';



  return (
    <div
      className={`fixed md:static top-0 left-0 h-full z-10 md:w-80 w-screen max-w-md bg-gradient-to-b from-purple-100 to-indigo-100 border-r border-gray-300 transition-transform transform ${
        hamburg ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 shadow-lg`}
    >
      <motion.div
        className="absolute top-4 right-4 text-3xl cursor-pointer md:hidden text-gray-600 hover:text-gray-800"
        onClick={() => setHamburg(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IoMdClose />
      </motion.div>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-300">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Outings</h1>
          <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white shadow-inner">
            <FiSearch className="w-6 h-6 mx-3 text-gray-500" />
            <input
              type="text"
              className="flex-1 p-3 focus:outline-none bg-transparent"
              placeholder="Search outings..."
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <motion.ul className="space-y-4">
            {filteredOutings.map((item, index) => (
              <motion.li
                key={index}
                className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleRoomClick(item.id, item.name)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-lg font-medium text-gray-800">{item.name}</div>
              </motion.li>
            ))}
          </motion.ul>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
        <div className="p-6 border-t border-gray-300 flex items-center justify-between bg-white shadow-md">
          <motion.div
            className="w-12 h-12 bg-gray-300 cursor-pointer rounded-full bg-cover bg-center shadow-md"
            style={{ backgroundImage: `url(${photoURL})` }}
            onClick={() => {
              router.push("/profile");
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          ></motion.div>
          <motion.button
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors duration-300"
            onClick={() => {
              router.push("/chat/new");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus className="mr-2" /> New Outing
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;