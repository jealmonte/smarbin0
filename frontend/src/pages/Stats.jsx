import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Recycle, Trash, Coins } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, className }) => (
  <div className={`p-6 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4">
      <Icon size={32} className="text-white/80" />
      <div>
        <h3 className="text-lg font-medium text-white/60">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default function Stats() {
  const [stats, setStats] = useState({
    paper: 0,
    glass: 0,
    food_organics: 0,
    metal: 0,
    cardboard: 0,
    miscellaneous_trash: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/waste-statistics/4/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>Error: {error}</div>;

  const totalRecycled = stats.paper + stats.glass + stats.metal + stats.cardboard;
  const non_recyclables = stats.food_organics + stats.miscellaneous_trash;
  const totalWaste = totalRecycled + non_recyclables;
  const recyclingRate = ((totalRecycled / totalWaste) * 100).toFixed(1);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
      >
        {/* Main Stats */}
        <div className="bg-emerald-600 rounded-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-4">
              <Recycle size={48} className="text-white" />
              <div>
                <h2 className="text-4xl font-bold">Recycled</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-2xl">Total: {totalRecycled}</span>
                  <div className="flex items-center gap-2 bg-emerald-700/50 px-4 py-2 rounded-lg">
                    <Coins size={16} className="text-white/80" />
                    <span className="text-lg font-semibold">{totalRecycled * 25} binbucks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Paper" value={stats.paper} icon={Recycle} className="bg-emerald-700" />
            <StatCard title="Glass" value={stats.glass} icon={Recycle} className="bg-emerald-700" />
            <StatCard title="Metal" value={stats.metal} icon={Recycle} className="bg-emerald-700" />
            <StatCard title="Cardboard" value={stats.cardboard} icon={Recycle} className="bg-emerald-700" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <Trash size={48} className="text-white" />
            <h2 className="text-4xl font-bold">Trash</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Non-recyclables" value={non_recyclables} icon={Trash} className="bg-gray-700" />
          </div>
        </div>
      </motion.div>

      {/* Recycling Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-900/30 rounded-lg p-6 mb-8"
      >
        <h3 className="text-xl font-bold mb-4">Recycling Progress</h3>
        <div className="relative h-4 bg-emerald-900/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${recyclingRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-emerald-500"
          />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-emerald-400">{recyclingRate}% recycled</span>
          <span className="text-emerald-400">Goal: 75%</span>
        </div>
      </motion.div>
    </div>
  );
}
