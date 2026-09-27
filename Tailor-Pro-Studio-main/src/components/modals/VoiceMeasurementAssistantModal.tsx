import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Check,
  X,
  Play,
  Square,
  RotateCcw,
  Ruler,
  Wand2,
  Plus,
  Trash2
} from 'lucide-react';
import { Client, GarmentMeasurements } from '../../types';
import {
  MEASUREMENT_FIELD_DEFS,
  extractMeasurementsFromTranscript
} from '../../utils/measurementVoiceParser';

interface VoiceMeasurementAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onApplyMeasurements: (measurements: Partial<GarmentMeasurements>) => void;
  currentMeasurements?: GarmentMeasurements;
}

const PRESET_DICTATIONS = [
  {
    title: 'Female Fitting Standard',
    text: 'Bust 36, Waist 28, Hips 40, Shoulder to Underbust 14, Sleeve Length 23'
  },
  {
    title: 'Bridal Kente Gown',
    text: 'Bust 38, Underbust 31, Breast Length 10.5, Waist 30, Hips 42, Full Length 58'
  },
  {
    title: 'Male Senator Suit',
    text: 'Chest 42, Shoulder 18.5, Waist 34, Inseam 32, Sleeve Length 25, Neck 16.5'
  },
  {
    title: 'Classic Trouser & Shirt',
    text: 'Chest 40, Top Length 31, Waist 32, Thigh 24, Knee 18, Inseam 30, Ankle 15'
  }
];

export const VoiceMeasurementAssistantModal: React.FC<VoiceMeasurementAssistantModalProps> = ({
  isOpen,
  onClose,
  client,
  onApplyMeasurements,
  currentMeasurements = {}
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [parsedValues, setParsedValues] = useState<Record<string, string>>({});
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [audioConfirmationEnabled, setAudioConfirmationEnabled] = useState<boolean>(true);

  // Audio Recording (MediaRecorder) State
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let accumulatedFinal = '';
          let accumulatedInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              accumulatedFinal += res[0].transcript + ' ';
            } else {
              accumulatedInterim += res[0].transcript;
            }
          }

          const combinedText = (accumulatedFinal + accumulatedInterim).trim();
          if (combinedText) {
            setTranscript(combinedText);
            const extracted = extractMeasurementsFromTranscript(combinedText);
            setParsedValues((prev) => ({ ...prev, ...extracted }));
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning/error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechSupported(false);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization failed:', err);
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Sync initial measurements if available when opened
  useEffect(() => {
    if (isOpen && currentMeasurements) {
      const initial: Record<string, string> = {};
      MEASUREMENT_FIELD_DEFS.forEach((field) => {
        const val = currentMeasurements[field.key as keyof GarmentMeasurements];
        if (val) initial[field.key] = String(val);
      });
      if (Object.keys(initial).length > 0 && Object.keys(parsedValues).length === 0) {
        setParsedValues(initial);
      }
    }
  }, [isOpen, currentMeasurements]);

  if (!isOpen) return null;

  // Start Voice & Tape Recording
  const handleStartListening = async () => {
    try {
      setFeedbackMessage('Listening live... speak your measurements naturally.');
      setIsListening(true);
      setRecordingDuration(0);

      // Start Web Speech Recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Recognition start exception:', err);
        }
      }

      // Start MediaRecorder audio stream capture
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioBlobUrl(url);
            stream.getTracks().forEach((track) => track.stop());
          };

          mediaRecorder.start();
          mediaRecorderRef.current = mediaRecorder;

          // Start Timer
          timerIntervalRef.current = setInterval(() => {
            setRecordingDuration((prev) => prev + 1);
          }, 1000);
        } catch (err) {
          console.warn('Microphone stream access error:', err);
        }
      }
    } catch (err) {
      console.warn('Could not start listening:', err);
      setIsListening(false);
    }
  };

  // Stop Listening & Finalize Recording
  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Recognition stop exception:', err);
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('MediaRecorder stop error:', err);
      }
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setIsListening(false);

    // Run quick local extraction pass
    if (transcript) {
      const extracted = extractMeasurementsFromTranscript(transcript);
      const count = Object.keys(extracted).length;
      if (count > 0) {
        setParsedValues((prev) => ({ ...prev, ...extracted }));
        setFeedbackMessage(`Extracted ${count} measurement${count > 1 ? 's' : ''} from voice dictation.`);
      }
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setTranscript(presetText);
    const extracted = extractMeasurementsFromTranscript(presetText);
    setParsedValues((prev) => ({ ...prev, ...extracted }));
    setFeedbackMessage(`Preset loaded: ${Object.keys(extracted).length} measurements extracted!`);
  };

  const runAiParsing = async (textToParse: string) => {
    const text = textToParse || transcript;
    if (!text.trim()) return;

    setIsAiProcessing(true);
    setFeedbackMessage('Analyzing voice dictation with Gemini AI...');

    try {
      const res = await fetch('/api/parse-dictation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text })
      });

      const data = await res.json();
      if (data.success && data.measurements && Object.keys(data.measurements).length > 0) {
        const merged = { ...parsedValues, ...data.measurements };
        setParsedValues(merged);
        const count = Object.keys(data.measurements).length;
        setFeedbackMessage(`AI extracted ${count} measurement${count > 1 ? 's' : ''}!`);

        if (audioConfirmationEnabled && 'speechSynthesis' in window) {
          const spokenText = `Extracted ${count} measurements. ${Object.entries(data.measurements)
            .map(([k, v]) => `${k} ${v} inches`)
            .join(', ')}`;
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        // Fallback to local regex engine
        const localExtracted = extractMeasurementsFromTranscript(text);
        setParsedValues((prev) => ({ ...prev, ...localExtracted }));
        setFeedbackMessage(`Extracted measurements via local Smart Tape engine.`);
      }
    } catch (err) {
      console.warn('AI Parse network fallback:', err);
      const localExtracted = extractMeasurementsFromTranscript(text);
      setParsedValues((prev) => ({ ...prev, ...localExtracted }));
      setFeedbackMessage(`Extracted measurements via local Smart Tape engine.`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSaveAndApply = () => {
    if (Object.keys(parsedValues).length === 0) {
      alert('Please dictate or enter at least one measurement before applying.');
      return;
    }

    onApplyMeasurements(parsedValues);

    if (audioConfirmationEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Saved measurements for ${client.name} to digital spec sheet.`
      );
      window.speechSynthesis.speak(utterance);
    }

    onClose();
  };

  const handleClear = () => {
    setTranscript('');
    setParsedValues({});
    setFeedbackMessage(null);
    setAudioBlobUrl(null);
    setRecordingDuration(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setIsPlayingAudio(false);
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 pt-[max(2.5rem,env(safe-area-inset-top))] sm:pt-6 overflow-y-auto font-['Outfit'] animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-0 sm:my-auto flex flex-col mt-1 sm:mt-0">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0D3B36] via-[#082824] to-[#124E47] p-5 sm:p-6 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-[#DCA134] border border-[#DCA134]/40 flex items-center justify-center shadow-inner">
              <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse text-amber-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-[#DCA134] bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  HANDS-FREE TAPE-RECORDER
                </span>
                {isListening && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    REC {formatTimer(recordingDuration)}
                  </span>
                )}
              </div>
              <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                Voice Tape-Recorder & Dictation
              </h2>
              <p className="text-xs text-emerald-100/80 font-medium">
                Dictate measurements naturally during client fitting for <span className="font-bold text-amber-300">{client.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">

          {/* Active Dictation Control & Waveform Section */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center space-y-4 text-center">
            
            {/* Visual Mic Button with Pulse */}
            <div className="relative">
              {isListening && (
                <>
                  <span className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping" />
                  <span className="absolute -inset-6 rounded-full bg-emerald-500/15 animate-pulse" />
                </>
              )}

              <button
                type="button"
                onClick={isListening ? handleStopListening : handleStartListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-4 ring-rose-300 dark:ring-rose-950'
                    : 'bg-[#0D3B36] text-amber-300 hover:bg-[#082824] ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-9 h-9" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isListening ? 'Listening Live to Master Tailor...' : 'Click Microphone to Start Dictating'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
                Speak clearly, e.g. <span className="text-[#0D3B36] dark:text-amber-300 font-semibold">"Bust 36, Waist 28, Hips 40, Shoulder 18.5, Sleeve 24"</span>
              </p>
            </div>

            {/* Audio Wave Visualizer Bars when listening */}
            {isListening && (
              <div className="flex items-center gap-1.5 h-6">
                {[35, 75, 40, 95, 65, 100, 50, 85, 45, 90, 30].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i % 5) * 0.15}s`,
                      animationDuration: '0.85s'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Audio Playback Bar if tape recorded */}
            {audioBlobUrl && (
              <div className="w-full max-w-md p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleAudioPlayback}
                    className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 flex items-center justify-center shadow-xs cursor-pointer font-bold"
                  >
                    {isPlayingAudio ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                      Fitting Audio Tape
                    </p>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400 font-mono">
                      Recorded Voice Note ({formatTimer(recordingDuration)})
                    </p>
                  </div>
                </div>

                <audio
                  ref={audioPlayerRef}
                  src={audioBlobUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />

                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/50 dark:bg-amber-900/50 px-2 py-0.5 rounded-md font-mono">
                  {isPlayingAudio ? 'Playing...' : 'Ready'}
                </span>
              </div>
            )}

            {/* Feedback Message */}
            {feedbackMessage && (
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{feedbackMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Preset Sample Dictations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-[#0D3B36] dark:text-amber-300" />
                <span>Fitting Presets (Click to Test / Demo)</span>
              </label>

              <button
                type="button"
                onClick={() => setAudioConfirmationEnabled(!audioConfirmationEnabled)}
                className={`text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  audioConfirmationEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Feedback: {audioConfirmationEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_DICTATIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.text)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition-all active:scale-95 group cursor-pointer"
                >
                  <p className="font-extrabold text-xs text-[#0D3B36] dark:text-amber-300 group-hover:underline">
                    {preset.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                    "{preset.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Dictation Transcript Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Spoken Dictation Transcript
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => runAiParsing(transcript)}
                  disabled={!transcript.trim() || isAiProcessing}
                  className="text-xs font-extrabold text-[#0D3B36] dark:text-amber-300 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAiProcessing ? 'Parsing with AI...' : 'AI Re-Parse'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => {
                const newText = e.target.value;
                setTranscript(newText);
                const extracted = extractMeasurementsFromTranscript(newText);
                setParsedValues((prev) => ({ ...prev, ...extracted }));
              }}
              placeholder="Dictate live into the mic or type e.g. 'Bust 36, Waist 28, Hips 40, Shoulder to Underbust 14, Sleeve 23'..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D3B36] dark:focus:ring-amber-400 resize-none font-mono"
            />
          </div>

          {/* Live Extracted Measurements Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[#DCA134]" />
                <span>Extracted Garment Measurements ({Object.keys(parsedValues).length})</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Inches (in)</span>
            </div>

            {Object.keys(parsedValues).length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No measurements extracted yet. Click the mic button to dictate or test with a preset!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MEASUREMENT_FIELD_DEFS.map((item) => {
                  const val = parsedValues[item.key];
                  if (!val) return null;
                  return (
                    <div
                      key={item.key}
                      className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between animate-fade-in"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider truncate block">
                          {item.label}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setParsedValues({ ...parsedValues, [item.key]: e.target.value })
                            }
                            className="w-16 font-extrabold text-sm text-[#0D3B36] dark:text-amber-300 bg-transparent border-b border-emerald-400 dark:border-emerald-600 focus:outline-none"
                          />
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">in</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...parsedValues };
                          delete updated[item.key];
                          setParsedValues(updated);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove measurement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAndApply}
            disabled={Object.keys(parsedValues).length === 0}
            className="px-6 py-2.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Apply Measurements to Spec Sheet</span>
          </button>
        </div>

      </div>
    </div>
  );
};
