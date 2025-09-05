import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ audioUrl, isGenerating = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (isGenerating) {
    return (
      <div className="min-h-[80px] flex items-center justify-center bg-white p-4 rounded-md border border-gray-200">
        <p className="text-gray-600 italic">Generating audio...</p>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="min-h-[80px] flex items-center justify-center bg-white p-4 rounded-md border border-gray-200">
        <p className="text-gray-500 italic">Audio will be generated and appear here.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80px] flex items-center justify-center bg-white p-4 rounded-md border border-gray-200">
      <div className="w-full max-w-lg">
        <audio 
          ref={audioRef}
          controls 
          className="w-full"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        >
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default AudioPlayer;
