'use client'

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebase/config';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { FiMenu, FiX, FiCalendar, FiMessageCircle, FiUser, FiLogOut, FiMap, FiUsers, FiStar, FiPlus } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useDispatch, useSelector } from "react-redux";
import { motion } from 'framer-motion';
import { FaArrowLeft } from "react-icons/fa";
import { settoken } from '@/store/ChatSlice';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const Home = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState('');
  const [tokenClient, setTokenClient] = useState(null);
  const [calendarColor, setCalendarColor] = useState('bg-red-600');
  const [lastAuthTime, setLastAuthTime] = useState(null);
  const dispatch= useDispatch()
  const currentuser = useSelector((state) => state.chat.user);
  
  useEffect(() => {
    if (user) {
      loadGoogleAuthScript();
      const storedAuthTime = localStorage.getItem('lastAuthTime');
      const storedColor = localStorage.getItem('calendarColor');
      if (storedAuthTime && storedColor) {
        const timeDiff = Date.now() - parseInt(storedAuthTime);
        if (timeDiff < 55 * 60 * 1000) {
          setCalendarColor(storedColor);
          setLastAuthTime(parseInt(storedAuthTime));
        } else {
          setCalendarColor('bg-red-600');
          localStorage.setItem('calendarColor', 'bg-red-600');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (lastAuthTime) {
      const timer = setTimeout(() => {
        setCalendarColor('bg-red-600');
        localStorage.setItem('calendarColor', 'bg-red-600');
      }, 55 * 60 * 1000 - (Date.now() - lastAuthTime));

      return () => clearTimeout(timer);
    }
  }, [lastAuthTime]);

  const loadGoogleAuthScript = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = initializeGoogleAuth;
    document.body.appendChild(script);
  };

  const initializeGoogleAuth = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: handleAuthResponse,
    });
    setTokenClient(client);
  };

  const handleAuthResponse = async (response) => {
    if (response.error !== undefined) {
      console.error(response);
      toast.error('Failed to authorize Google Calendar');
    } else {
      try {
        const accessToken = response.access_token
        sessionStorage.setItem('accessToken', accessToken)
        dispatch(settoken(accessToken))
        console.log(accessToken)
        
        setRefreshToken(response.refresh_token);
        toast.success('Google Calendar authorized successfully!', {
          autoClose: 3000,
        });
        setCalendarColor('bg-green-600');
        const currentTime = Date.now();
        setLastAuthTime(currentTime);
        localStorage.setItem('calendarColor', 'bg-green-600');
        localStorage.setItem('lastAuthTime', currentTime.toString());
        await sendtoken(currentuser, accessToken);
      } catch (error) {
        console.error('Failed to send token:', error);
      }
    }
  };

  const handleGoogleAuthClick = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      toast.error('Google Auth is not initialized yet. Please wait and try again.');
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      sessionStorage.removeItem('user');
      router.push('/sign-in');
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };



  const sendtoken = async (currentuser, accessToken) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'insomnia/9.2.0'
        },
        body: JSON.stringify({
          email: currentuser,
          accessToken: accessToken
        }),
      });

      if (res.ok) {
        console.log('Token sent to backend', accessToken);
        
       
      } else {
        console.error('Failed to send token to backend:', res.statusText);
     

      }
    } catch (error) {
      console.error('Error sending user token:', error);
   
    }
  };



  return (
    <ProtectedRoute>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-cover bg-center min-h-screen flex flex-col"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="bg-black bg-opacity-60 min-h-screen flex flex-col">
        <nav className="p-4 flex justify-between items-center text-white">
            <motion.h1 
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              className="text-3xl font-bold text-blue-300"
            >
              Teepon
            </motion.h1>
            <div className="md:hidden z-50">
              <button onClick={toggleMenu} className="focus:outline-none">
                {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
            <motion.ul 
              className={`fixed inset-0 flex flex-col items-center justify-center bg-black md:bg-transparent bg-opacity-90 transition-all duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-row md:items-center md:space-x-8 md:pr-10`}
              initial={false}
              animate={isMenuOpen ? "open" : "closed"}
              variants={{
                open: { x: 0 },
                closed: { x: "-100%" },
              }}
            >
              <li><button onClick={() => router.push('/profile')} className="flex items-center space-x-2 py-4 md:py-0 hover:text-blue-300 transition-colors"><FiUser /><span>Profile</span></button></li>
              <li><button onClick={() => router.push('/chat')} className="flex items-center space-x-2 py-4 md:py-0 hover:text-blue-300 transition-colors"><FiMessageCircle /><span>Chat</span></button></li>
              <li><button onClick={handleLogout} className="flex items-center space-x-2 py-4 md:py-0 hover:text-blue-300 transition-colors"><FiLogOut /><span>Log out</span></button></li>
            </motion.ul>
          </nav>

          <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-white max-w-2xl mb-16"
            >
              <h2 className="text-5xl font-bold mb-6 text-blue-300">Discover Amazing Adventures with Friends</h2>
              <p className="text-xl mb-8">Plan unforgettable outings and create lasting memories together.</p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/chat/new')} 
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Create Outing
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleAuthClick} 
                  className={`px-8 py-3 ${calendarColor} text-white font-bold rounded-full hover:bg-green-700 transition-colors flex items-center`}
                >
                  <FiCalendar className="mr-2" />
                  Authorize Google Calendar
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full"
            >
              <div className="bg-white bg-opacity-10 p-6 rounded-lg text-white">
                <FiMap className="text-4xl mb-4 text-blue-300" />
                <h3 className="text-xl font-bold mb-2">Explore New Places</h3>
                <p>Discover hidden gems and exciting locations for your next adventure.</p>
              </div>
              <div className="bg-white bg-opacity-10 p-6 rounded-lg text-white">
                <FiUsers className="text-4xl mb-4 text-blue-300" />
                <h3 className="text-xl font-bold mb-2">Connect with Friends</h3>
                <p>Easily plan and coordinate outings with your friend group.</p>
              </div>
              <div className="bg-white bg-opacity-10 p-6 rounded-lg text-white">
                <FiStar className="text-4xl mb-4 text-blue-300" />
                <h3 className="text-xl font-bold mb-2">Create Memories</h3>
                <p>Turn your plans into unforgettable experiences and cherished moments.</p>
              </div>
            </motion.div>
          </main>

          <footer className="bg-black bg-opacity-75 text-white py-6 px-4 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>&copy; 2024 Teepon. All rights reserved.</p>
              </div>
              <div className="flex flex-col md:flex-row md:space-x-8">
                <div className="mb-4 md:mb-0">
                  <h4 className="font-bold mb-2">Quick Links</h4>
                  <ul className="space-y-1">
                    <li><a href="#" className="hover:text-blue-300 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-blue-300 transition-colors">FAQs</a></li>
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Blog</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Legal</h4>
                  <ul className="space-y-1">
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-blue-300 transition-colors">Contact Us</a></li>
                  </ul>
                </div>
              </div>
            </div>
        
          </footer>
          
          <ToastContainer position="bottom-right" />
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default Home;