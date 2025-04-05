import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';

export default function Contact() {
  const navigate = useNavigate();

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-900/50 rounded-lg p-8"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center">Contact Support</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-emerald-200 mb-2">Subject</label>
                <input 
                  type="text" 
                  id="subject"
                  className="w-full bg-black/20 border border-emerald-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-emerald-200 mb-2">Message</label>
                <textarea 
                  id="message"
                  rows="4"
                  className="w-full bg-black/20 border border-emerald-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Describe your issue or feedback..."
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}