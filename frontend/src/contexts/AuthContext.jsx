import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to register user with Django backend
  const registerWithDjango = async (user, profile) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabase_uid: user.id,
          email: user.email,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || ''
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to register user with Django backend');
      }
    } catch (error) {
      console.error('Error registering with Django:', error);
    }
  };

  // Function to fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error.message);
      return null;
    }
  };

  // Set user and fetch profile when auth state changes
  const handleAuthChange = async (session) => {
    const currentUser = session?.user || null;
    setUser(currentUser);
    
    if (currentUser) {
      const profile = await fetchUserProfile(currentUser.id);
      setUserProfile(profile);
      
      // Register with Django after getting profile
      registerWithDjango(currentUser, profile);
    } else {
      setUserProfile(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      handleAuthChange(session);
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
        
        // Fetch the profile after creating it
        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);
        
        // Register with Django backend
        if (data.user) {
          registerWithDjango(data.user, {
            first_name: firstName,
            last_name: lastName
          });
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
        const profile = await fetchUserProfile(data.user.id);
        
        if (!profile) {
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
          } else {
            // Fetch the newly created profile
            const newProfile = await fetchUserProfile(data.user.id);
            setUserProfile(newProfile);
          }
        } else {
          setUserProfile(profile);
        }
        
        // Register with Django backend
        registerWithDjango(data.user, profile);
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
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    userProfile, // Add userProfile to the context
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
