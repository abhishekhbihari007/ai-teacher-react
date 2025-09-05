import React, { useState, useEffect } from 'react';

const MessageBox = ({ message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="message-box" style={{ display: 'block' }}>
      {message}
    </div>
  );
};

export default MessageBox;
