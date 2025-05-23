import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomePopup = ({ onComplete }) => {
  const [companyName, setCompanyName] = useState('');
  const [companyPurpose, setCompanyPurpose] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const companyInfo = {
      name: companyName,
      purpose: companyPurpose,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    onComplete(companyInfo);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Welcome to Your AI Assistant
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your company name"
                required
              />
            </div>
            <div>
              <label htmlFor="companyPurpose" className="block text-sm font-medium text-gray-700 mb-2">
                What is your company about?
              </label>
              <textarea
                id="companyPurpose"
                value={companyPurpose}
                onChange={(e) => setCompanyPurpose(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your company's purpose..."
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomePopup; 