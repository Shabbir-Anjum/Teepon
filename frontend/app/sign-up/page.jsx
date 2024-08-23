'use client';

import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebase/config';
import { useRouter } from 'next/navigation';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

import { setUser, setUserdata,setname } from '@/store/ChatSlice';
const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dispatch = useDispatch();



  const validateEmail = (email) => {
    return email.endsWith('@gmail.com');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter your username.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email must end with @gmail.com.');
      return;
    }
    setError('');
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      const refreshToken = res.user.uid;
      const accessToken= res.user.uid;
      const name= username
      dispatch(setname(username))
      sessionStorage.setItem('user', true);
      dispatch(setUser(email));
      dispatch(setUserdata(res));
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      router.push('/');
      await sendUserDetailsToBackend(name, email, accessToken, refreshToken);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please enter another email.');
      } else {
        setError(e.message);
      }
      console.error(e);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };


  const sendUserDetailsToBackend = async (name, email, accessToken, refreshToken) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          accessToken,
          refreshToken
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User added');
      } else {
        console.error('Failed to add user:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending user details to backend:', error);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-96 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>
        {error && <p className="text-red-500 mb-5">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
            <div
              className="absolute top-3 right-3 text-gray-400 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
            </div>
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-gray-500">or</span>
          <hr className="w-full border-gray-300" />
        </div>
        <button
          onClick={() => router.push('/sign-in')}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition duration-300"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

export default SignUp;
