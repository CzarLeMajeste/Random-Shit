"use client";

import React, { useState, useRef } from "react";

export default function AudioRecorder() {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "success" | "error">("idle");
  const [transcription, setTranscription] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setStatus("processing");
        await uploadAndTranscribe(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000); // chunk every 1 sec
      setStatus("recording");
      drawVisualizer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setStatus("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const uploadAndTranscribe = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");
      
      const data = await response.json();
      setTranscription(data.transcription);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTranscription("Sorry, we encountered an error while processing your audio. Please make sure your GCP configuration is correct in .env.local.");
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(99, 102, 241, ${barHeight / 100})`;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height / 2 - barHeight / 2, barWidth - 1, barHeight, 4);
        ctx.fill();
        x += barWidth;
      }
    };
    draw();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-xl rounded-[2rem] shadow-xl w-full max-w-2xl border border-white/60 transition-all duration-500">
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-32 opacity-80 pointer-events-none" 
        />
        <button
          onClick={status === "recording" ? stopRecording : startRecording}
          disabled={status === "processing"}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            status === "recording" 
              ? "bg-rose-500 hover:bg-rose-600 animate-pulse scale-110 shadow-rose-500/40" 
              : status === "processing"
              ? "bg-amber-400 cursor-not-allowed shadow-amber-400/40"
              : "bg-indigo-500 hover:bg-indigo-600 hover:scale-105 shadow-indigo-500/40"
          }`}
        >
          {status === "recording" && <div className="w-8 h-8 bg-white rounded-sm" />}
          {status === "idle" && (
            <svg className="w-10 h-10 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
          {status === "processing" && (
            <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          )}
          {status === "error" && (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {status === "success" && (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
        </button>
      </div>

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          {status === "idle" && "Ready to Record"}
          {status === "recording" && "Listening..."}
          {status === "processing" && "Transcribing Audio..."}
          {status === "success" && "Transcription Complete"}
          {status === "error" && "An Error Occurred"}
        </h2>
        <p className="text-slate-500 font-medium">
          {status === "idle" && "Press the microphone to begin"}
          {status === "recording" && "Speak clearly into your microphone"}
          {status === "processing" && "Hang tight, our AI is processing..."}
        </p>
      </div>

      {(transcription || status === "success" || status === "error") && (
        <div className="w-full bg-white/70 rounded-2xl p-6 border border-white shadow-sm mt-2 relative">
          <p className="text-slate-700 leading-relaxed text-lg min-h-[4rem] whitespace-pre-wrap">
            {transcription || "..."}
          </p>
        </div>
      )}

      {(status === "success" || status === "error") && (
        <button 
          onClick={() => { setStatus("idle"); setTranscription(null); }}
          className="mt-8 px-6 py-2.5 bg-slate-100/80 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-semibold transition-colors shadow-sm"
        >
          {status === "error" ? "Try Again" : "Record Another"}
        </button>
      )}
    </div>
  );
}
