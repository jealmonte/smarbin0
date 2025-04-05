import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Recycle } from 'lucide-react';
import Stats from './Stats';
import AuthNavbar from '../components/AuthNavbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CameraControl from '../components/CameraControl';

export default function Dashboard() {
  const { loading, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        // Try to fetch the profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: user.id,
                email: user.email,
                first_name: '',
                last_name: ''
              }
            ])
            .select()
            .single();

          if (!insertError) {
            setProfile(newProfile);
          } else {
            console.error('Error creating profile:', insertError);
          }
        } else if (!error) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const userName = profile?.first_name 
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
    : 'there';

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome, {userName}!</h1>
              <p className="text-emerald-100">Track your recycling impact and manage your waste data.</p>
            </div>
          </motion.div>

          <Stats />
          <CameraControl />

          <div className="text-center mt-12 mb-8">
            <Link 
              to="/contact" 
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Have feedback or need assistance?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}