"use client";

import AudioPlayer from "@/app/components/AudioPlayer";
import { supabase } from "@/app/supabase";
import React, { useState, useRef } from "react";

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      chunksRef.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
    }
  };

  const [shortLink, setShortLink] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadAudio = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    const fileName = `audio_${Date.now()}.webm`;

    try {
      const { error } = await supabase.storage
        .from("audio-uploads")
        .upload(fileName, audioBlob, {
          contentType: "audio/webm",
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("audio-uploads")
        .getPublicUrl(fileName);

      console.log("Audio uploaded successfully:", publicUrlData.publicUrl);
      setShortLink(publicUrlData.publicUrl);
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        {isRecording ? (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={startRecording}
          >
            Start Recording
          </button>
        )}
      </div>
      <div>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      {audioBlob && (
        <div>
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
            onClick={uploadAudio}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Audio"}
          </button>
        </div>
      )}
      {shortLink && (
        <div>
          <p>Share this link: {shortLink}</p>
          {audioBlob && <AudioPlayer src={shortLink} />}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
