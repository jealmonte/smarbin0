import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, firstName, lastName }) => {
    try {
      setError(null);

      // First check if user exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (existingUser?.user) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      // If user doesn't exist, proceed with signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) throw signUpError;

      // Create profile with name information
      if (data?.user) {
        // Use rpc to ensure atomic operation
        const { error: profileError } = await supabase.rpc('create_profile', {
          user_id: data.user.id,
          user_email: data.user.email,
          first_name: firstName,
          last_name: lastName
        });

        if (profileError) {
          console.error('Error creating profile:', profileError.message);
          // Create profile directly if RPC fails
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                email: data.user.email,
                first_name: firstName,
                last_name: lastName
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile directly:', insertError.message);
          }
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error.message);
      setError(error.message);
      return { data: null, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Ensure profile exists
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                email: data.user.email
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError.message);
          }
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error.message);
      setError(error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error.message);
      setError(error.message);
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};