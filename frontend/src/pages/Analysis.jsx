import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, TreePine, Factory, CloudRain } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AuthNavbar from '../components/AuthNavbar';

const ImpactCard = ({ title, value, unit, icon: Icon, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-emerald-900/30 rounded-lg p-6"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-emerald-500/20 rounded-lg">
        <Icon size={24} className="text-emerald-400" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <div className="mb-2">
      <span className="text-3xl font-bold text-emerald-400">{value}</span>
      <span className="text-emerald-400 ml-2">{unit}</span>
    </div>
    <p className="text-emerald-100/70 text-sm">{description}</p>
  </motion.div>
);

const monthlyData = [
  { name: 'Jan', recycled: 42, waste: 28 },
  { name: 'Feb', recycled: 48, waste: 25 },
  { name: 'Mar', recycled: 55, waste: 22 },
  { name: 'Apr', recycled: 62, waste: 20 },
  { name: 'May', recycled: 70, waste: 18 },
  { name: 'Jun', recycled: 85, waste: 15 }
];

const materialData = [
  { name: 'Paper', amount: 25, color: '#34d399' },
  { name: 'Glass', amount: 18, color: '#60a5fa' },
  { name: 'Plastic', amount: 22, color: '#f472b6' },
  { name: 'Metal', amount: 12, color: '#a78bfa' },
  { name: 'Cardboard', amount: 8, color: '#fbbf24' }
];

export default function Analysis() {
  const navigate = useNavigate();

  // Calculate impact based on recycling data
  const calculateImpact = () => {
    // Example calculations based on average values
    const paper = 25; // from Stats
    const glass = 18;
    const plastic = 22;
    const metal = 12;
    const cardboard = 8;
    const organicWaste = 15;
    const nonRecyclables = 28;

    const totalRecycled = paper + glass + plastic + metal + cardboard;
    const totalWaste = organicWaste + nonRecyclables;

    // Approximate calculations
    const treesPreserved = (paper + cardboard) * 0.12;
    const co2Reduced = totalRecycled * 2.5; // kg of CO2
    const waterSaved = (glass * 4) + (paper * 10) + (plastic * 3); // liters
    const energySaved = totalRecycled * 4.5; // kWh

    return {
      treesPreserved: treesPreserved.toFixed(1),
      co2Reduced: co2Reduced.toFixed(1),
      waterSaved: waterSaved.toFixed(1),
      energySaved: energySaved.toFixed(1),
      recyclingRate: ((totalRecycled / (totalRecycled + totalWaste)) * 100).toFixed(1)
    };
  };

  const impact = calculateImpact();

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

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Your Environmental Impact</h2>
              <p className="text-emerald-100">
                See how your recycling efforts are making a difference for our planet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ImpactCard
                title="Trees Preserved"
                value={impact.treesPreserved}
                unit="trees"
                icon={TreePine}
                description="Trees saved through paper and cardboard recycling"
              />
              <ImpactCard
                title="CO₂ Emissions Reduced"
                value={impact.co2Reduced}
                unit="kg"
                icon={Factory}
                description="Reduction in carbon dioxide emissions"
              />
              <ImpactCard
                title="Water Saved"
                value={impact.waterSaved}
                unit="liters"
                icon={CloudRain}
                description="Water conserved through recycling efforts"
              />
              <ImpactCard
                title="Energy Saved"
                value={impact.energySaved}
                unit="kWh"
                icon={Leaf}
                description="Energy preserved through recycling"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-emerald-950/50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Monthly Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="recycledGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: '#fff'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="recycled" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#recycledGradient)" 
                        name="Recycled"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="waste" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#wasteGradient)" 
                        name="Waste"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-emerald-950/50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Material Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={materialData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 25
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: '#fff'
                        }}
                      />
                      <Bar 
                        dataKey="amount" 
                        name="Items"
                        fill="#10b981"
                      >
                        {materialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Recycling Rate</h3>
              <div className="relative h-4 bg-emerald-900/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${impact.recyclingRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-emerald-500"
                />
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-emerald-400">{impact.recyclingRate}% recycled</span>
                <span className="text-emerald-400">Goal: 75%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}