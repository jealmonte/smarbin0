// src/components/CameraControl.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CameraControl() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const startCamera = async () => {
    if (!user) {
      setError('You must be logged in to use the camera');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/start-camera/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabase_uid: user.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start camera');
      }
      
      setIsRunning(true);
    } catch (err) {
      setError('Failed to start camera: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopCamera = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/stop-camera/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop camera');
      }
      
      setIsRunning(false);
    } catch (err) {
      setError('Failed to stop camera: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex space-x-4 my-4">
      <button 
        onClick={startCamera} 
        disabled={isLoading || isRunning || !user}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
      >
        {isLoading ? 'Processing...' : 'Start Camera'}
      </button>
      
      <button 
        onClick={stopCamera} 
        disabled={isLoading || !isRunning}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
      >
        {isLoading ? 'Processing...' : 'Stop Camera'}
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
