import React, { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth, generateScript, generateSummary, generateTTS } from './utils/api';
import { processFiles } from './utils/pdfUtils';
import { createAudioFromBase64 } from './utils/audioUtils';
import { useRetry } from './hooks/useRetry';
import ErrorBoundary from './components/ErrorBoundary';
import MessageBox from './components/MessageBox';
import LoadingSpinner from './components/LoadingSpinner';
import FileUpload from './components/FileUpload';
import PDFViewer from './components/PDFViewer';
import AudioPlayer from './components/AudioPlayer';
import VideoPlayer from './components/VideoPlayer';

function App() {
  // State management
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Loading states
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  // Button visibility states
  const [showSummaryButton, setShowSummaryButton] = useState(false);
  const [showScriptButton, setShowScriptButton] = useState(false);
  const [showAudioButton, setShowAudioButton] = useState(false);
  const [showAudioFromScriptButton, setShowAudioFromScriptButton] = useState(false);
  const [showVideoButton, setShowVideoButton] = useState(false);

  const { executeWithRetry } = useRetry(5);

  // Message display helper
  const showMessage = useCallback((msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }, []);

  // Reset UI states
  const resetGenerationUIs = useCallback(() => {
    setShowSummaryButton(false);
    setShowScriptButton(false);
    setShowAudioButton(false);
    setShowAudioFromScriptButton(false);
    setShowVideoButton(false);
    setExtractedText('');
    setGeneratedScript('');
    setGeneratedSummary('');
    setAudioUrl('');
    setVideoUrl('');
  }, []);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const result = await checkBackendHealth();
      showMessage(result.message, result.success ? 3000 : 7000);
    };
    checkHealth();
  }, [showMessage]);

  // Handle file upload
  const handleFileUpload = useCallback((files) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      showMessage('File(s) uploaded successfully!');
      resetGenerationUIs();
    } else {
      showMessage('Please upload a valid file.', 5000);
      resetGenerationUIs();
    }
  }, [showMessage, resetGenerationUIs]);

  // Extract text from files
  const handleExtractText = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      showMessage('Please upload file(s) first.', 3000);
      return;
    }

    setIsExtracting(true);
    try {
      const { fullText, isDocx } = await processFiles(uploadedFiles);
      
      if (isDocx) {
        showMessage('DOCX files require a server-side parser. Using simulated text for demo.', 7000);
      }

      if (fullText.trim() === '') {
        showMessage('No text found in the files.', 5000);
        setExtractedText('');
      } else {
        setExtractedText(fullText);
        setShowSummaryButton(true);
        setShowAudioButton(true);
        setShowScriptButton(true);
        showMessage('Text extracted successfully! Ready for audio, script or summary generation.');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      showMessage('Failed to extract text from file(s).', 5000);
      setExtractedText('');
    } finally {
      setIsExtracting(false);
    }
  }, [uploadedFiles, showMessage]);

  // Generate teaching script
  const handleGenerateScript = useCallback(async () => {
    if (!extractedText) {
      showMessage('Please extract text from a PDF first.', 3000);
      return;
    }

    setIsGeneratingScript(true);
    setShowSummaryButton(false);
    setShowAudioButton(false);
    setShowAudioFromScriptButton(false);
    setShowVideoButton(false);
    setGeneratedScript('');
    setAudioUrl('');
    setVideoUrl('');

    try {
      const result = await executeWithRetry(() => generateScript(extractedText));
      const scriptText = result?.script;
      
      if (scriptText) {
        setGeneratedScript(scriptText);
        setShowAudioFromScriptButton(true);
        setShowVideoButton(true);
        showMessage('Teaching script generated successfully! Ready for audio or video generation.');
      } else {
        showMessage('AI did not return a valid script.', 5000);
        console.error('Malformed backend response:', result);
      }
    } catch (error) {
      console.error('Error generating script:', error);
      showMessage('Failed to generate script. Please try again.', 5000);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [extractedText, executeWithRetry, showMessage]);

  // Generate summary
  const handleGenerateSummary = useCallback(async () => {
    if (!extractedText) {
      showMessage('Please extract text from a PDF first.', 3000);
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const result = await executeWithRetry(() => generateSummary(extractedText));
      const summaryText = result?.summary;
      
      if (summaryText) {
        setGeneratedSummary(summaryText);
        showMessage('Summary generated successfully!');
      } else {
        showMessage('Backend did not return a valid summary.', 5000);
        console.error('Malformed backend response:', result);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      showMessage('Failed to generate summary. Please try again.', 5000);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [extractedText, executeWithRetry, showMessage]);

  // Generate and play audio
  const handleGenerateAudio = useCallback(async (useScript = false) => {
    const textToSpeak = useScript ? generatedScript : extractedText;
    const sourceMessage = useScript ? 'from the generated script' : 'from the extracted text';

    if (!textToSpeak) {
      showMessage(useScript ? 'Please generate a teaching script first.' : 'Please extract text from a PDF first.', 3000);
      return;
    }

    setIsGeneratingAudio(true);
    setAudioUrl('');

    try {
      const result = await executeWithRetry(() => generateTTS(textToSpeak, "Kore"));
      const audioB64 = result?.data;
      const mimeType = result?.mimeType || 'audio/wav';
      
      if (audioB64) {
        const audioUrl = createAudioFromBase64(audioB64, mimeType);
        setAudioUrl(audioUrl);
        showMessage('Audio generated and playing!');
      } else {
        showMessage('Backend did not return valid audio.', 5000);
        console.error('Malformed backend audio response:', result);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      showMessage('Failed to generate audio. Please try again.', 5000);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [extractedText, generatedScript, executeWithRetry, showMessage]);

  // Generate avatar video (simulated)
  const handleGenerateVideo = useCallback(async () => {
    if (!generatedScript) {
      showMessage('Please generate a teaching script first to create an avatar video.', 3000);
      return;
    }

    setIsGeneratingVideo(true);
    setVideoUrl('');

    // Simulate API call for avatar video generation
    const simulatedVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    // Simulate a delay for the "AI generation"
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      if (simulatedVideoUrl) {
        setVideoUrl(simulatedVideoUrl);
        showMessage('AI avatar video generated!');
      } else {
        showMessage('Failed to generate avatar video.', 5000);
      }
    } catch (error) {
      console.error('Error generating avatar video:', error);
      showMessage('Failed to generate avatar video.', 5000);
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [generatedScript, showMessage]);

  return (
    <ErrorBoundary>
      <div className="antialiased text-gray-800">
        <MessageBox message={message} />
        
        <div className="container">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          AI Teacher Platform
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload a PDF to get started with your AI-powered lesson!
        </p>

        {/* File Upload Section */}
        <FileUpload 
          onFileUpload={handleFileUpload}
          onExtractText={handleExtractText}
          isExtracting={isExtracting}
        />

        {/* PDF Viewer Section */}
        <PDFViewer files={uploadedFiles} />

        {/* Extracted Text Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Extracted Text</h2>
          <div className="min-h-[150px] bg-white p-4 rounded-md border border-gray-200 overflow-y-auto text-gray-700 text-sm leading-relaxed">
            {extractedText ? (
              <div className="text-gray-700">{extractedText}</div>
            ) : (
              <p className="text-gray-500 italic">Extracted text will appear here.</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {showSummaryButton && (
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className={`font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md ${
                  isGeneratingSummary 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {isGeneratingSummary ? 'Generating...' : 'Summarize All Files'}
              </button>
            )}
            {showAudioButton && (
              <button
                onClick={() => handleGenerateAudio(false)}
                disabled={isGeneratingAudio}
                className={`font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md ${
                  isGeneratingAudio 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isGeneratingAudio ? 'Generating...' : 'Generate and Play Audio (from Extracted Text)'}
              </button>
            )}
            {showScriptButton && (
              <button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className={`font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md ${
                  isGeneratingScript 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isGeneratingScript ? 'Generating...' : 'Generate Teaching Script'}
              </button>
            )}
          </div>
          <LoadingSpinner show={isExtracting} className="mt-4" />
        </div>

        {/* AI-Generated Summary Section */}
        <div className="bg-yellow-50 p-6 rounded-lg shadow-inner mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">AI-Generated Summary</h2>
          <div className="min-h-[150px] bg-white p-4 rounded-md border border-gray-200 overflow-y-auto text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {generatedSummary ? (
              <div className="text-gray-700">{generatedSummary}</div>
            ) : (
              <p className="text-gray-500 italic">The AI-generated summary will appear here.</p>
            )}
          </div>
          <LoadingSpinner show={isGeneratingSummary} className="mt-4" />
        </div>

        {/* AI-Generated Teaching Script Section */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-inner mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">AI-Generated Teaching Script</h2>
          <div className="min-h-[200px] bg-white p-4 rounded-md border border-gray-200 overflow-y-auto text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {generatedScript ? (
              <div className="text-gray-700">{generatedScript}</div>
            ) : (
              <p className="text-gray-500 italic">The AI-generated teaching script will appear here.</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {showAudioFromScriptButton && (
              <button
                onClick={() => handleGenerateAudio(true)}
                disabled={isGeneratingAudio}
                className={`font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md ${
                  isGeneratingAudio 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isGeneratingAudio ? 'Generating...' : 'Generate and Play Audio (from Script)'}
              </button>
            )}
            {showVideoButton && (
              <button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className={`font-semibold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-md ${
                  isGeneratingVideo 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isGeneratingVideo ? 'Generating...' : 'Generate Avatar Video'}
              </button>
            )}
          </div>
          <LoadingSpinner show={isGeneratingScript} className="mt-4" />
        </div>

        {/* Audio Player Section */}
        <div className="bg-teal-50 p-6 rounded-lg shadow-inner mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Listen to the Lecture</h2>
          <AudioPlayer audioUrl={audioUrl} isGenerating={isGeneratingAudio} />
          <LoadingSpinner show={isGeneratingAudio} className="mt-4" />
        </div>

        {/* Avatar Video Player Section */}
        <div className="bg-yellow-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">AI Teacher Video</h2>
          <VideoPlayer videoUrl={videoUrl} isGenerating={isGeneratingVideo} />
          <LoadingSpinner show={isGeneratingVideo} className="mt-4" />
        </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
