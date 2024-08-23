'use client';

import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebase/config';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser, setUserdata,setname } from '@/store/ChatSlice';
const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(email, password);
      if (res) {
        sessionStorage.setItem('user', 'true');
        router.push('/');
        
        const email= res.user.email;
        const parts = email.split('@');
        const name= parts[0]
        dispatch(setname(name))
        dispatch(setUser(email));
        dispatch(setUserdata(res));
      }
    } catch (e) {
      console.error('Sign-in error:',);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      if (res) {
        const credential = GoogleAuthProvider.credentialFromResult(res);
        if (!credential) {
          throw new Error('No credential from result');
        }
        
        const accessToken = credential.accessToken;
        const refreshToken = credential.idToken;
        const name = res.user.displayName;
        const email = res.user.email;
        router.push('/');
        await sendUserDetailsToBackend(name, email, accessToken, refreshToken);

        sessionStorage.setItem('user', 'true');

        
       
      }
    } catch (e) {
      console.error('Google sign-in error:', e);
    }
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
        console.log('User added:', data);
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
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-gray-500">or</span>
          <hr className="w-full border-gray-300" />
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition duration-300"
        >
          <FcGoogle size={24} />
          Sign in with Google
        </button>
        <button
            onClick={()=> router.push('/sign-up')}
            className="w-full bg-purple-600 text-white py-2 my-6 rounded-lg hover:bg-purple-700 transition duration-300"
            
          >
         Sign Up
          </button>
        {error && (
          <p className="mt-4 text-red-500 text-center">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignIn;