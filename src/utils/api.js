// API utility functions
const BACKEND_BASE = (window.BACKEND_BASE || 'http://localhost:8000').replace(/\/$/, '');

export const checkBackendHealth = async () => {
  try {
    const resp = await fetch(`${BACKEND_BASE}/health`);
    if (!resp.ok) throw new Error(`status ${resp.status}`);
    const data = await resp.json();
    if (data?.status === 'ok') {
      return { success: true, message: 'Connected to backend.' };
    } else {
      return { success: false, message: 'Backend health check returned unexpected response.' };
    }
  } catch (e) {
    return { success: false, message: 'Cannot reach backend. Please start the server on port 8000.' };
  }
};

export const generateScript = async (text) => {
  const apiUrl = `${BACKEND_BASE}/script`;
  const payload = { text };
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
  }

  return response.json();
};

export const generateSummary = async (text) => {
  const apiUrl = `${BACKEND_BASE}/summary`;
  const payload = { text };
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
  }

  return response.json();
};

export const generateTTS = async (text, voiceName = "Kore") => {
  const apiUrl = `${BACKEND_BASE}/tts`;
  const payload = { text, voice_name: voiceName };
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error or could not parse response." }));
    throw new Error(`TTS API returned status ${response.status}: ${JSON.stringify(errorData)}`);
  }

  return response.json();
};
