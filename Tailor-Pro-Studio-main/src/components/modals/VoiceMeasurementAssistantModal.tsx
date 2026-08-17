import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Check,
  X,
  Play,
  RotateCcw,
  Ruler,
  AlertCircle,
  Wand2,
  ListPlus
} from 'lucide-react';
import { Client, GarmentMeasurements } from '../../types';

interface VoiceMeasurementAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onApplyMeasurements: (measurements: Partial<GarmentMeasurements>) => void;
  currentMeasurements?: GarmentMeasurements;
}

// Key mapping definitions for regex & labels
const MEASUREMENT_KEY_MAP: Array<{
  key: keyof Omit<GarmentMeasurements, 'genderCategory' | 'segment' | 'garmentType'>;
  label: string;
  aliases: string[];
}> = [
  { key: 'bust', label: 'Bust', aliases: ['bust', 'bustline'] },
  { key: 'chest', label: 'Chest', aliases: ['chest', 'chestline'] },
  { key: 'waist', label: 'Waist', aliases: ['waist', 'waistline', 'natural waist'] },
  { key: 'hips', label: 'Hips', aliases: ['hips', 'hip', 'hipline'] },
  { key: 'shoulder', label: 'Shoulder', aliases: ['shoulder', 'shoulder width', 'across shoulder'] },
  { key: 'underbust', label: 'Underbust', aliases: ['underbust', 'under bust', 'shoulder to underbust'] },
  { key: 'breastLength', label: 'Breast Length', aliases: ['breast length', 'shoulder to bust', 'apex'] },
  { key: 'neck', label: 'Neck', aliases: ['neck', 'neckline', 'collar'] },
  { key: 'sleeveLength', label: 'Sleeve Length', aliases: ['sleeve length', 'sleeve', 'arm length'] },
  { key: 'roundSleeves', label: 'Round Sleeves', aliases: ['round sleeve', 'round sleeves', 'bicep', 'armhole'] },
  { key: 'topLength', label: 'Top Length', aliases: ['top length', 'shirt length', 'blouse length'] },
  { key: 'skirtLength', label: 'Skirt Length', aliases: ['skirt length'] },
  { key: 'fullLength', label: 'Full Length', aliases: ['full length', 'gown length', 'dress length', 'total length'] },
  { key: 'thigh', label: 'Thigh', aliases: ['thigh', 'upper leg'] },
  { key: 'knee', label: 'Knee', aliases: ['knee'] },
  { key: 'ankle', label: 'Ankle', aliases: ['ankle'] },
  { key: 'inseam', label: 'Inseam', aliases: ['inseam', 'trouser length', 'inside leg'] },
];

const PRESET_DICTATIONS = [
  {
    title: 'Female Fitting Sample',
    text: 'Bust 36, Waist 28, Hips 40, Shoulder to Underbust 14, Sleeve Length 23'
  },
  {
    title: 'Bridal Kente Gown',
    text: 'Bust 38, Underbust 31, Breast Length 10.5, Waist 30, Hips 42, Full Length 58'
  },
  {
    title: 'Male Senator Suit',
    text: 'Chest 42, Shoulder 18.5, Waist 34, Inseam 32, Sleeve Length 25, Neck 16.5'
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

  const recognitionRef = useRef<any>(null);

  // Local instant Regex parser
  const parseLocalTranscript = (text: string) => {
    const lower = text.toLowerCase();

    setParsedValues((prev) => {
      const newExtracted: Record<string, string> = { ...prev };

      MEASUREMENT_KEY_MAP.forEach((item) => {
        item.aliases.forEach((alias) => {
          // Look for alias followed by digits (e.g., "bust 36", "hips 40.5")
          const regex = new RegExp(`${alias}\\s*(?:is|=|:)?\\s*(\\d+(?:\\.\\d+)?)`, 'i');
          const match = lower.match(regex);
          if (match && match[1]) {
            newExtracted[item.key] = match[1];
          }
        });
      });

      return newExtracted;
    });
  };

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript((prev) => {
          const updated = prev ? `${prev} ${currentTranscript}` : currentTranscript;
          parseLocalTranscript(updated);
          return updated;
        });
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechSupported(false);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  if (!isOpen) return null;

  const handleStartListening = () => {
    if (recognitionRef.current) {
      try {
        setFeedbackMessage('Listening live... speak your measurements naturally.');
        setIsListening(true);
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    } else {
      setSpeechSupported(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Failed to stop speech recognition:', err);
      }
    }
    setIsListening(false);
  };

  const handleApplyPreset = (presetText: string) => {
    setTranscript(presetText);
    parseLocalTranscript(presetText);
    runAiParsing(presetText);
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
        const msg = `Successfully extracted ${count} measurement${count > 1 ? 's' : ''}!`;
        setFeedbackMessage(msg);

        // Voice Feedback Confirmation
        if (audioConfirmationEnabled && 'speechSynthesis' in window) {
          const spokenText = `Extracted ${count} measurements. ${Object.entries(data.measurements)
            .map(([k, v]) => `${k} ${v} inches`)
            .join(', ')}`;
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        // Fallback to local regex if AI returned no specific schema
        parseLocalTranscript(text);
        setFeedbackMessage('Parsed measurements via local Voice Assistant engine.');
      }
    } catch (err) {
      console.error('AI Parse error:', err);
      parseLocalTranscript(text);
      setFeedbackMessage('Parsed measurements via local Voice Assistant engine.');
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
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-start sm:items-center justify-center p-4 sm:p-6 pt-[max(2.5rem,env(safe-area-inset-top))] sm:pt-6 overflow-y-auto font-['Outfit'] animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-0 sm:my-auto flex flex-col mt-1 sm:mt-0">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0D3B36] via-[#082824] to-[#124E47] p-5 sm:p-6 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-[#DCA134] border border-[#DCA134]/40 flex items-center justify-center shadow-inner">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider text-[#DCA134] bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  HANDS-FREE TAPE-RECORDER
                </span>
              </div>
              <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                Voice Measurement Assistant
              </h2>
              <p className="text-xs text-emerald-100/80 font-medium">
                Dictate measurements naturally during client fitting for {client.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">

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
                Speak clearly, e.g. <span className="text-[#0D3B36] dark:text-amber-300 font-semibold">"Bust 36, Waist 28, Hips 40, Shoulder to Underbust 14"</span>
              </p>
            </div>

            {/* Audio Wave Visualizer Bars when listening */}
            {isListening && (
              <div className="flex items-center gap-1.5 h-6">
                {[40, 75, 30, 90, 60, 100, 45, 80, 35].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
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
                <span>Quick Fitting Presets (Click to Test)</span>
              </label>

              <button
                type="button"
                onClick={() => setAudioConfirmationEnabled(!audioConfirmationEnabled)}
                className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                  audioConfirmationEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Feedback: {audioConfirmationEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_DICTATIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.text)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition-all active:scale-95 group"
                >
                  <p className="font-extrabold text-xs text-[#0D3B36] dark:text-amber-300 group-hover:underline">
                    {preset.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
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
                  className="text-xs font-extrabold text-[#0D3B36] dark:text-amber-300 hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAiProcessing ? 'Parsing with AI...' : 'AI Re-Parse'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                parseLocalTranscript(e.target.value);
              }}
              placeholder="Dictate live or type e.g. 'Bust 36, Waist 28, Hips 40, Shoulder to Underbust 14'..."
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
                  No measurements extracted yet. Speak into the microphone or click a preset sample above!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MEASUREMENT_KEY_MAP.map((item) => {
                  const val = parsedValues[item.key];
                  if (!val) return null;
                  return (
                    <div
                      key={item.key}
                      className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between animate-fade-in"
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
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

                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAndApply}
            disabled={Object.keys(parsedValues).length === 0}
            className="px-6 py-2.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Apply Measurements to Client Spec Sheet</span>
          </button>
        </div>

      </div>
    </div>
  );
};
