"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface CallProps {
  roomID: string;
  customerName?: string;
}

export default function PermanentFreeCall({ roomID, customerName }: CallProps) {
  const [inCall, setInCall] = useState(false);
  const [status, setStatus] = useState("Ready to Call");
  
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    remoteAudioRef.current = new Audio();
    remoteAudioRef.current.autoplay = true;

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket', 
      addTrailingSlash: false,
    });

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join-room', roomID);
    });

    socketRef.current.on('signal', async (data: any) => {
      if (!peerConnectionRef.current) return;

      if (data.offer) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socketRef.current?.emit('signal', { roomID, answer });
        setStatus("Call Connected! 🟢");
      } else if (data.answer) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setStatus("Call Connected! 🟢");
      } else if (data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Ice candidate error", e);
        }
      }
    });

    return () => {
      socketRef.current?.disconnect();
      endCall();
    };
  }, [roomID]);

  const startCall = async () => {
    try {
      setStatus("Requesting Microphone...");
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      peerConnectionRef.current = new RTCPeerConnection(rtcConfig);

      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          peerConnectionRef.current?.addTrack(track, localStreamRef.current);
        }
      });

      // 🔴 RECORDING SETUP START
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(localStreamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setStatus("Saving Recording... ⏳");
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const fileName = `call_${roomID}_${Date.now()}.mp3`;

        const formData = new FormData();
        formData.append('audio', audioBlob, fileName);

        try {
          const response = await fetch('/api/upload-audio', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          if (data.url) {
            console.log("✅ Recording saved at:", data.url);
            setStatus("Recording Saved! 💾");
          }
        } catch (error) {
          console.error("Upload failed", error);
          setStatus("Save Failed ❌");
        }
      };
      
      mediaRecorderRef.current.start();
      // 🔴 RECORDING SETUP END

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('signal', { roomID, candidate: event.candidate });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current?.emit('signal', { roomID, offer });

      setInCall(true);
      setStatus("Ringing... 🔔");
    } catch (err) {
      console.error("Mic Access Error:", err);
      setStatus("Microphone Blocked ❌");
      alert("Call karne ke liye Microphone ki permission deni hogi!");
    }
  };

  const endCall = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); 
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setInCall(false);
    if (status !== "Saving Recording... ⏳" && status !== "Recording Saved! 💾") {
        setStatus("Call Ended");
    }
  };

  return (
    <div className="p-4 border border-green-200 rounded-lg text-center bg-white shadow-sm mb-4">
      <h3 className="text-sm font-bold text-gray-800 mb-1">
        {customerName ? `Support for ${customerName}` : 'Live Support Call'}
      </h3>
      <p className="text-xs font-semibold text-gray-500 mb-3">{status}</p>
      
      {!inCall ? (
        <button 
          onClick={startCall} 
          className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 w-full flex items-center justify-center gap-2 transition-all"
        >
          📞 Call Support (FREE)
        </button>
      ) : (
        <button 
          onClick={endCall} 
          className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 w-full flex items-center justify-center gap-2 transition-all shadow-lg animate-pulse"
        >
          ❌ Cut Call & Save
        </button>
      )}
    </div>
  );
}