import React, { useEffect, useRef, useState } from 'react';
import './VideoPage.css';

const VideoConference = ({ roomName = 'ShikshaSankalpDefault', userName = 'User' }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Keep track of the script element
    let scriptElement = null;

    // Check if script is already loaded
    if (!document.querySelector('script[src="https://meet.jit.si/external_api.js"]')) {
      scriptElement = document.createElement('script');
      scriptElement.src = 'https://meet.jit.si/external_api.js';
      scriptElement.async = true;
      scriptElement.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(scriptElement);
    } else {
      setIsScriptLoaded(true);
    }

    // Cleanup function
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []); // Empty dependency array - script loads only once

  useEffect(() => {
    // Only initialize Jitsi when the script is loaded
    if (isScriptLoaded && !jitsiApiRef.current) {
      if (!window.JitsiMeetExternalAPI) {
        console.error('Jitsi Meet API not loaded');
        return;
      }

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording',
            'livestreaming', 'settings', 'raisehand', 'videoquality',
            'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help',
            'mute-everyone'
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        }
      };

      try {
        // Dispose of any existing instance
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }
        
        // Create new instance
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Add event listeners
        jitsiApiRef.current.addEventListeners({
          videoConferenceJoined: handleConferenceJoined,
          participantJoined: handleParticipantJoined,
          participantLeft: handleParticipantLeft,
          readyToClose: handleReadyToClose
        });
      } catch (error) {
        console.error('Error initializing Jitsi:', error);
      }
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [isScriptLoaded, roomName, userName]);

  const handleConferenceJoined = (event) => {
    console.log('Conference joined:', event);
  };

  const handleParticipantJoined = (event) => {
    console.log('Participant joined:', event);
  };

  const handleParticipantLeft = (event) => {
    console.log('Participant left:', event);
  };

  const handleReadyToClose = () => {
    console.log('Jitsi is ready to close');
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
  };

  return (
    <div className="video-conference-container">
      <div className="video-conference" ref={jitsiContainerRef}></div>
    </div>
  );
};

export default VideoConference;