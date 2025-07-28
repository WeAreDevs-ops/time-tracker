import React from 'react';
import { motion } from 'framer-motion';

const Header = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8"
  >
    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Work Time Tracker
    </h1>
    <p className="text-gray-300">Professional timesheet management with photo verification</p>
  </motion.div>
);

export default Header;