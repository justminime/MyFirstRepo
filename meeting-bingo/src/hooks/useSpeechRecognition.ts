import { useState, useEffect, useCallback, useRef } from 'react';

const TERMINAL_ERRORS = new Set(['not-allowed', 'service-not-allowed']);
const BACKOFF_INITIAL_MS = 300;
const BACKOFF_CAP_MS = 5_000;

// SpeechRecognition is not in TypeScript 6's DOM lib; declare the subset we use
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

const getSpeechRecognition = (): (new () => SpeechRecognition) | null =>
  (window as unknown as Record<string, unknown>)['SpeechRecognition'] as (new () => SpeechRecognition) | null
  ?? (window as unknown as Record<string, unknown>)['webkitSpeechRecognition'] as (new () => SpeechRecognition) | null
  ?? null;

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (onFinalResult?: (segment: string) => void) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const SpeechRecognitionCtor = getSpeechRecognition();
  const isSupported = SpeechRecognitionCtor !== null;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const backoffRef = useRef(BACKOFF_INITIAL_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinalResultRef = useRef<((segment: string) => void) | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }
      if (final) {
        setTranscript(prev => prev + final);
        onFinalResultRef.current?.(final);
        backoffRef.current = BACKOFF_INITIAL_MS;
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      if (TERMINAL_ERRORS.has(event.error)) {
        shouldListenRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setInterimTranscript('');
      if (!shouldListenRef.current) return;

      const delay = backoffRef.current;
      backoffRef.current = Math.min(delay * 2, BACKOFF_CAP_MS);

      timerRef.current = setTimeout(() => {
        if (shouldListenRef.current) {
          try { recognition.start(); } catch { /* already running */ }
        }
      }, delay);
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimer();
      shouldListenRef.current = false;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try { recognition.stop(); } catch { /* ignore */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback((onFinalResult?: (segment: string) => void) => {
    if (!recognitionRef.current) return;
    onFinalResultRef.current = onFinalResult ?? null;
    shouldListenRef.current = true;
    backoffRef.current = BACKOFF_INITIAL_MS;
    setIsListening(true);
    setError(null);
    try { recognitionRef.current.start(); } catch { /* already running */ }
  }, []);

  const stopListening = useCallback(() => {
    clearTimer();
    shouldListenRef.current = false;
    setIsListening(false);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
