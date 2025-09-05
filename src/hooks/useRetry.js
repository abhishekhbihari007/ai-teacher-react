import { useState, useCallback } from 'react';

export const useRetry = (maxRetries = 5) => {
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async (asyncFunction) => {
    let currentRetryCount = 0;
    
    while (currentRetryCount < maxRetries) {
      try {
        const result = await asyncFunction();
        setRetryCount(0); // Reset on success
        return result;
      } catch (error) {
        console.error(`Attempt ${currentRetryCount + 1} failed:`, error);
        
        if (currentRetryCount === maxRetries - 1) {
          setRetryCount(0);
          throw error; // Re-throw on final attempt
        }
        
        // Check if error is retryable (429 or 5xx status codes)
        const isRetryable = error.message.includes('429') || 
                           error.message.includes('5') ||
                           error.message.includes('status 5');
        
        if (isRetryable) {
          const delay = Math.pow(2, currentRetryCount) * 1000;
          console.warn(`Retrying in ${delay / 1000} seconds... (Attempt ${currentRetryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          currentRetryCount++;
          setRetryCount(currentRetryCount);
        } else {
          setRetryCount(0);
          throw error; // Don't retry non-retryable errors
        }
      }
    }
  }, [maxRetries]);

  return { executeWithRetry, retryCount };
};
