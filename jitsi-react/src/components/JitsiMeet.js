import React, { useState } from "react";

const JitsiMeet = () => {
  const [roomName, setRoomName] = useState("ShikshaSankalpDemoRoom");
  const [userName, setUserName] = useState("");
  const [meetingStarted, setMeetingStarted] = useState(false);

  const handleStartMeeting = () => {
    if (roomName.trim() !== "" && userName.trim() !== "") {
      setMeetingStarted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {!meetingStarted ? (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Join a Jitsi Meeting</h2>
          <input
            type="text"
            placeholder="Enter Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-gray-700 border border-gray-600 text-white"
          />
          <input
            type="text"
            placeholder="Enter Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
          />
          <button
            onClick={handleStartMeeting}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Start Meeting
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-4">Meeting: {roomName}</h2>
          <iframe
            src={`https://meet.jit.si/${roomName}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-[500px] rounded-lg border-none"
          ></iframe>
          <button
            onClick={() => setMeetingStarted(false)}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            End Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default JitsiMeet;
