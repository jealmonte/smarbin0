import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';

const GiftCard = ({ name, amount, binBucks, imageUrl }) => (
  <div className="bg-emerald-900/30 rounded-lg p-6 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <img src={imageUrl} alt={`${name} logo`} className="w-12 h-12 object-contain" />
      <div>
        <h3 className="text-xl font-bold text-white">${amount} {name} Gift Card</h3>
        <p className="text-emerald-400">{binBucks} binbucks required</p>
      </div>
    </div>
    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors">
      Redeem
    </button>
  </div>
);

export default function Redeem() {
  const navigate = useNavigate();

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-4xl mx-auto">
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

            <h2 className="text-2xl font-bold text-white mb-8">Redeem Your binbucks</h2>

            <div className="space-y-4 mb-8">
              <GiftCard
                name="Amazon"
                amount={5}
                binBucks={200}
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
              />
              <GiftCard
                name="Visa"
                amount={5}
                binBucks={200}
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
              />
              <GiftCard
                name="Amazon"
                amount={10}
                binBucks={350}
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
              />
              <GiftCard
                name="Visa"
                amount={10}
                binBucks={350}
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
              />
              <GiftCard
                name="Chipotle"
                amount={10}
                binBucks={350}
                imageUrl="https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Chipotle_Mexican_Grill_logo.svg/1024px-Chipotle_Mexican_Grill_logo.svg.png"
              />
            </div>

            <div className="bg-black/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-500 mb-2">Fair Use Policy</h3>
                  <p className="text-gray-300">
                    Each recycled item earns you 1 binbuck. A recycled item counts as any substantial recyclable item (e.g., cardboard box, metal can, glass bottle, or sheet of paper). 
                    Attempting to game the system by submitting multiple scans of subdivided items will result in immediate suspension of redemption privileges. 
                    All submissions are verified by our AI system.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}