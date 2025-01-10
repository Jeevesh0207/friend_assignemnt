import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        username,
        password
      });
      login(response.data.token, response.data.userId);
      localStorage.setItem('username', username);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      localStorage.removeItem('username');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="animate-float"
            >
              <LogIn size={32} className="text-mint" />
            </motion.div>
            <h1 className="text-3xl font-bold ml-2 bg-gradient-to-r text-mint bg-clip-text text-transparent">
              Login
            </h1>
          </motion.div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Username
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input w-full p-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full p-3"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="glass-button w-full py-3 px-4"
            >
              Login
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-blue-900 dark:text-blue-100"
          >
            Don't have an account?{' '}
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="/register"
              className="text-mint font-medium"
            >
              Register
            </motion.a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;