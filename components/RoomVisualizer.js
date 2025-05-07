// components/RoomVisualizer.js
"use client";

import { useEffect, useRef, useState } from 'react';

export default function RoomVisualizer({ selectedItems }) {
  const viewerContainerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const [error, setError] = useState(null);
  const [isViewerReady, setIsViewerReady] = useState(false);

  // Function to update the panorama
  const updatePanorama = async () => {
    try {
      setError(null); // Clear any previous errors
      setIsViewerReady(false); // Show loading state

      console.log('Requesting panorama with selected items:', selectedItems);
      
      // Make API call to generate the composite image
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedItems
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate panorama');
      }

      // Get the response data
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate panorama');
      }
      
      if (!data.imageData) {
        throw new Error('No image data received');
      }

      console.log('Received image data successfully');
      const imageUrl = data.imageData; // This is already a data URL

      // Initialize or update Pannellum viewer
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.destroy();
      }

      console.log('Initializing Pannellum viewer');

      // Initialize new viewer with the generated panorama
      viewerInstanceRef.current = window.pannellum.viewer(
        viewerContainerRef.current.id,
        {
          type: 'equirectangular',
          panorama: imageUrl,
          autoLoad: true,
          showControls: true,
          compass: true,
          autoRotate: -2,
          onLoad: () => {
            console.log('Pannellum viewer loaded successfully');
            setIsViewerReady(true);
            setError(null);
          },
          onError: (err) => {
            console.error('Pannellum initialization error:', err);
            setError('Failed to load panorama viewer: ' + err);
          }
        }
      );
    } catch (err) {
      console.error('Failed to update panorama:', err);
      setError(err.message || 'Failed to generate panorama. Please try again.');
      setIsViewerReady(false);
    }
  };

  // Update panorama when selected items change
  useEffect(() => {
    if (!viewerContainerRef.current) return;

    // Wait for pannellum to be available
    if (typeof window !== 'undefined' && !window.pannellum) {
      const checkPannellum = setInterval(() => {
        if (window.pannellum) {
          clearInterval(checkPannellum);
          updatePanorama();
        }
      }, 100);
      
      return () => clearInterval(checkPannellum);
    } else if (typeof window !== 'undefined' && window.pannellum) {
      updatePanorama();
    }
  }, [selectedItems]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div 
      id="panorama-viewer" 
      ref={viewerContainerRef} 
      className="w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden relative"
    >
      {!isViewerReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
    </div>
  );
}