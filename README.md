# AI Teacher Platform - React Version

A modern React application that converts PDF documents into AI-generated teaching content with audio and video capabilities.

## Features

- **PDF/DOCX Upload**: Upload and process multiple PDF and DOCX files
- **Text Extraction**: Extract text content from uploaded documents
- **AI-Generated Content**: 
  - Summaries using AI
  - Teaching scripts optimized for presentation
- **Audio Generation**: Convert text to speech using TTS API
- **Video Generation**: Simulated AI avatar video creation
- **Responsive Design**: Modern UI with Tailwind CSS

## Project Structure

```
src/
├── components/          # React components
│   ├── AudioPlayer.js   # Audio playback component
│   ├── FileUpload.js    # File upload interface
│   ├── LoadingSpinner.js # Loading indicator
│   ├── MessageBox.js    # Toast notifications
│   ├── PDFViewer.js     # PDF display component
│   ├── TextDisplay.js   # Text content display
│   └── VideoPlayer.js   # Video playback component
├── hooks/               # Custom React hooks
│   └── useRetry.js      # Retry logic for API calls
├── utils/               # Utility functions
│   ├── api.js           # API communication
│   ├── audioUtils.js    # Audio processing utilities
│   └── pdfUtils.js      # PDF processing utilities
├── App.js               # Main application component
├── index.js             # Application entry point
└── index.css            # Global styles
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Backend Requirements

This application requires a backend API running on `http://localhost:8000` with the following endpoints:

- `GET /health` - Health check
- `POST /script` - Generate teaching script
- `POST /summary` - Generate summary
- `POST /tts` - Text-to-speech conversion

## Key Improvements from HTML Version

1. **Component Architecture**: Broken down into reusable React components
2. **State Management**: Centralized state management with React hooks
3. **Error Handling**: Improved error handling with retry logic
4. **Code Organization**: Better separation of concerns
5. **Reusability**: Components can be easily reused and extended
6. **Type Safety**: Better development experience with modern JavaScript
7. **Performance**: Optimized rendering and state updates

## Technologies Used

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **PDF.js**: PDF processing library
- **Custom Hooks**: Reusable stateful logic
- **Modern JavaScript**: ES6+ features and async/await

## Development

The app will automatically reload when you make changes to the source files. You can also run `npm run build` to create a production build.
