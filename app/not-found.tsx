'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center flex-col justify-center "
    >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-7xl font-extrabold text-black dark:text-white mb-4 drop-shadow-lg"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}          
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-lg text-gray-700 dark:text-gray-200 mb-6"
        >
          This page wandered off into the void. Let’s guide you back home.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Link
            href="/"            
            className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            🚀 Back to Home
          </Link>
        </motion.div>
    </motion.div>
  );
}
