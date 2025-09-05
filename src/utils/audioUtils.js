// Audio processing utilities

/**
 * Base64 to ArrayBuffer conversion for audio data.
 * @param {string} base64 - Base64 encoded string.
 * @returns {ArrayBuffer}
 */
export const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Converts PCM audio data to WAV format.
 * @param {Int16Array} pcm16 - PCM audio data (16-bit signed).
 * @param {number} sampleRate - Sample rate of the audio.
 * @returns {Blob} WAV audio blob.
 */
export const pcmToWav = (pcm16, sampleRate) => {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM

  const buffer = new ArrayBuffer(44 + pcm16.length * bytesPerSample);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm16.length * bytesPerSample, true);
  writeString(view, 8, 'WAVE');

  // FMT sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // Byte rate
  view.setUint16(32, numChannels * bytesPerSample, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample

  // DATA sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcm16.length * bytesPerSample, true);

  // Write PCM data
  let offset = 44;
  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(offset, pcm16[i], true);
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Helper function to write a string to a DataView.
 * @param {DataView} view
 * @param {number} offset
 * @param {string} string
 */
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

export const createAudioFromBase64 = (audioB64, mimeType = 'audio/wav') => {
  const byteCharacters = atob(audioB64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const wavBlob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(wavBlob);
};
