import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, TreePine, Factory, CloudRain } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AuthNavbar from '../components/AuthNavbar';
import { useAuth } from '../contexts/AuthContext';

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

export default function Analysis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    paper: 0,
    glass: 0,
    food_organics: 0,
    metal: 0,
    cardboard: 0,
    miscellaneous_trash: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/waste-statistics/?supabase_uid=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  const materialData = [
    { name: 'Paper', amount: stats.paper, color: '#34d399' },
    { name: 'Glass', amount: stats.glass, color: '#60a5fa' },
    { name: 'Food Waste', amount: stats.food_organics, color: '#f472b6' },
    { name: 'Metal', amount: stats.metal, color: '#a78bfa' },
    { name: 'Cardboard', amount: stats.cardboard, color: '#fbbf24' }
  ];

  const generateWeeklyData = () => {
    const totalRecycled = stats.paper + stats.glass + stats.metal + stats.cardboard;
    const totalWaste = stats.food_organics + stats.miscellaneous_trash;
    
    const currentWeek = totalRecycled * 0.4;
    const week1 = totalRecycled * 0.15;
    const week2 = totalRecycled * 0.2;
    const week3 = totalRecycled * 0.25;
    
    const currentWasteWeek = totalWaste * 0.4;
    const wasteWeek1 = totalWaste * 0.2;
    const wasteWeek2 = totalWaste * 0.2;
    const wasteWeek3 = totalWaste * 0.2;
    
    return [
      { name: '3 Weeks Ago', recycled: Math.round(week1), waste: Math.round(wasteWeek1) },
      { name: '2 Weeks Ago', recycled: Math.round(week2), waste: Math.round(wasteWeek2) },
      { name: 'Last Week', recycled: Math.round(week3), waste: Math.round(wasteWeek3) },
      { name: 'This Week', recycled: Math.round(currentWeek), waste: Math.round(currentWasteWeek) },
    ];
  };

  const weeklyData = generateWeeklyData();

  const calculateImpact = () => {
    const totalRecycled = stats.paper + stats.glass + stats.metal + stats.cardboard;
    const non_recyclables = stats.food_organics + stats.miscellaneous_trash;
    const totalWaste = totalRecycled + non_recyclables;
    
    const weeklyRecycled = totalRecycled;    
    const paperWeight = stats.paper * 0.1;
    const cardboardWeight = stats.cardboard * 0.2;
    const glassWeight = stats.glass * 0.3;
    const metalWeight = stats.metal * 0.1;
    
    const annualPaperWeight = paperWeight * 52;
    const annualCardboardWeight = cardboardWeight * 52;
    const annualGlassWeight = glassWeight * 52;
    const annualMetalWeight = metalWeight * 52;
    
    const treesPreserved = (annualPaperWeight + annualCardboardWeight) * 0.017;
    const co2Reduced = (annualPaperWeight * 3.3) + (annualGlassWeight * 0.3) + 
                      (annualCardboardWeight * 3.1) + (annualMetalWeight * 4.0);
    const waterSaved = (annualPaperWeight * 60) + (annualGlassWeight * 20) + 
                      (annualCardboardWeight * 50) + (annualMetalWeight * 15);
    const energySaved = (annualPaperWeight * 4.0) + (annualGlassWeight * 4.8) + 
                       (annualCardboardWeight * 4.0) + (annualMetalWeight * 14.0);
    
    const recyclingRate = totalWaste > 0 ? ((totalRecycled / totalWaste) * 100).toFixed(1) : 0;

    return {
      treesPreserved: treesPreserved.toFixed(1),
      co2Reduced: co2Reduced.toFixed(1),
      waterSaved: waterSaved.toFixed(1),
      energySaved: energySaved.toFixed(1),
      recyclingRate: recyclingRate
    };
  };

  const impact = calculateImpact();

  if (loading) return <div>Loading...</div>;

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
                <h3 className="text-xl font-bold mb-6">Weekly Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
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
