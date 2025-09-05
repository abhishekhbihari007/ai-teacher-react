import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ videoUrl, isGenerating = false }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
      setIsLoaded(true);
    }
  }, [videoUrl]);

  if (isGenerating) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-white p-4 rounded-md border border-gray-200">
        <p className="text-gray-600 italic">Generating AI avatar video...</p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-white p-4 rounded-md border border-gray-200">
        <p className="text-gray-500 italic">The AI avatar video will appear here.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[300px] flex items-center justify-center bg-white p-4 rounded-md border border-gray-200">
      <video 
        ref={videoRef}
        controls 
        className="w-full max-w-2xl rounded-md shadow-lg"
        poster="https://placehold.co/640x360/e0e7ff/4338ca?text=AI+Avatar+Placeholder"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video element.
      </video>
    </div>
  );
};

export default VideoPlayer;
