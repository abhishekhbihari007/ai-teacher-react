import React from 'react';

const TextDisplay = ({ 
  title, 
  content, 
  placeholder, 
  className = "min-h-[150px] bg-white p-4 rounded-md border border-gray-200 overflow-y-auto text-gray-700 text-sm leading-relaxed whitespace-pre-wrap",
  actions = null 
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">{title}</h2>
      <div className={className}>
        {content ? (
          <div className="text-gray-700">{content}</div>
        ) : (
          <p className="text-gray-500 italic">{placeholder}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {actions}
        </div>
      )}
    </div>
  );
};

export default TextDisplay;
