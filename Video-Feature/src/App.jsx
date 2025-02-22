import React, { useState, useEffect } from 'react';
import VideoPage from './pages/VideoPage';
import ReportGenerator from './pages/ReportGenerator/index';
import transcriptData from './assets/transcript.json';

const App = () => {
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
  try {
    if (transcriptData) {
      // Check if the data has a transcript array property
      if (transcriptData.transcript && Array.isArray(transcriptData.transcript)) {
        const formattedTranscript = transcriptData.transcript
          .map(entry => `[${entry.speaker}]: ${entry.text}`)
          .join('\n');
        setTranscript(formattedTranscript);
      } 
      // Handle flat array (your original case)
      else if (Array.isArray(transcriptData)) {
        const formattedTranscript = transcriptData
          .map(entry => `[${entry.speaker}]: ${entry.text}`)
          .join('\n');
        setTranscript(formattedTranscript);
      }
      // If it's just a string
      else if (typeof transcriptData === 'string') {
        setTranscript(transcriptData);
      }
      // Fallback - stringify the whole object
      else {
        setTranscript(JSON.stringify(transcriptData, null, 2));
      }
    }
  } catch (error) {
    console.error('Error processing transcript data:', error);
    setTranscript('Error loading transcript');
  }
}, []);

  return (
    <div className="App">
      {/* Uncomment VideoPage if you want to show it */}
      {/* <VideoPage
        roomName="ShikshaSankalpRoom123"
        userName="JohnDoe"
      /> */}

      {transcript ? (
        <ReportGenerator transcript={transcript} />
      ) : (
        <div>Loading transcript...</div>
      )}
    </div>
  );
};

export default App;