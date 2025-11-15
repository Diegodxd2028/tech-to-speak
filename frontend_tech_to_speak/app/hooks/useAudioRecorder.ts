import { useState, useRef } from 'react';
import { audioService, ExplainResponse } from '../services/audioService';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setExplanation(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const checkSilence = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const rms = Math.sqrt(
            dataArrayRef.current.reduce((sum, val) => sum + val * val, 0) /
            dataArrayRef.current.length
          );

          if (rms < 10) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                stopRecording();
              }, 2000);
            }
          } else {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          }
        }
        if (isRecording) {
          requestAnimationFrame(checkSilence);
        }
      };
      checkSilence();
    } catch (error) {
      const message = 'Error al acceder al micrófono';
      setError(message);
      console.error(message, error);
    }
  };

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      analyserRef.current = null;
      dataArrayRef.current = null;
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleExplain = async (areaOficio: string = 'TI') => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);
    try {
      const filename = `recording-${new Date().getTime()}.webm`;
      const result = await audioService.explainAudio(audioBlob, filename, areaOficio);
      setExplanation(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar audio';
      setError(message);
      console.error(message, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      const filename = `recording-${new Date().getTime()}.webm`;
      audioService.downloadAudio(audioBlob, filename);
    }
  };

  const handleNewRecording = () => {
    setAudioBlob(null);
    setExplanation(null);
    setError(null);
  };

  return {
    isRecording,
    recordingTime,
    audioBlob,
    isProcessing,
    explanation,
    error,
    handleRecordClick,
    handleExplain,
    handleDownload,
    handleNewRecording,
  };
};