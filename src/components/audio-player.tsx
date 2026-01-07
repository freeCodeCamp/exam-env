import { TriangleUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { logger } from "@sentry/react";
import { FullQuestion } from "../utils/types";

interface AudioPlayerProps {
  fullQuestion: FullQuestion;
}

export function AudioPlayer({ fullQuestion }: AudioPlayerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const fragmentRef = useRef({ start: 0, end: 0, duration: 0 });

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audioUrl = fullQuestion.audio?.url;
    if (!audioUrl) return;

    const loadAudio = async () => {
      setIsLoading(true);
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }

        const fragment = parseMediaFragment(audioUrl);

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        const audioBuffer =
          await audioCtxRef.current.decodeAudioData(arrayBuffer);
        bufferRef.current = audioBuffer;

        const totalBufferDuration = audioBuffer.duration;
        const start = fragment.start;
        const end = fragment.end || totalBufferDuration;
        const validDuration = end - start;

        fragmentRef.current = { start, end, duration: validDuration };

        setDuration(validDuration);
        setIsPlaying(false);
        setProgress(0);
        pausedAtRef.current = 0;
      } catch (e) {
        if (e instanceof Error) {
          logger.warn(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      startTimeRef.current = 0;
      pausedAtRef.current = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [fullQuestion]);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const play = useCallback(() => {
    if (!audioCtxRef.current || !bufferRef.current) return;

    // ensure context is running (browsers suspend it sometimes)
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    const { start: fragmentStart, duration: fragmentDuration } =
      fragmentRef.current;

    if (pausedAtRef.current >= fragmentDuration) {
      pausedAtRef.current = 0;
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = bufferRef.current;
    source.connect(audioCtxRef.current.destination);
    sourceRef.current = source;

    const offset = fragmentStart + pausedAtRef.current;
    const durationToPlay = fragmentDuration - pausedAtRef.current;

    source.start(0, offset, durationToPlay);

    startTimeRef.current = audioCtxRef.current.currentTime;
    setIsPlaying(true);

    const updateProgress = () => {
      if (!audioCtxRef.current) return;

      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      const currentProgress = pausedAtRef.current + elapsed;

      if (currentProgress >= fragmentDuration) {
        handlePause();
        setProgress(fragmentDuration);
        pausedAtRef.current = fragmentDuration;
      } else {
        setProgress(currentProgress);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    // Handle natural end (though the duration param in start() usually handles this)
    source.onended = () => {
      // this triggers on stop() too -> rely on the animation loop for UI logic
    };
  }, []);

  const handlePause = () => {
    if (!audioCtxRef.current) return;

    const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
    pausedAtRef.current += elapsed;

    stopAudio();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      play();
    }
  };

  const handleSeek = (val: number) => {
    if (isNaN(val)) return;

    setProgress(val);

    pausedAtRef.current = val;

    if (isPlaying) {
      stopAudio();
      play();
    }
  };

  function formatTime(time: unknown): string {
    if (typeof time !== "number" || isNaN(time)) {
      return "0:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  if (!fullQuestion.audio) return null;

  return (
    <Box role="region" aria-label="Audio player" width="100%">
      <Flex direction="column" gap={2}>
        <Flex alignItems="center" gap={4}>
          <Button
            onClick={togglePlay}
            isLoading={isLoading}
            isDisabled={isLoading}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            colorScheme="blue"
            size="sm"
          >
            {isLoading ? (
              <Spinner size="xs" />
            ) : isPlaying ? (
              "||"
            ) : (
              <TriangleUpIcon style={{ transform: "rotate(90deg)" }} />
            )}
          </Button>

          <Text fontSize="sm" fontFamily="monospace">
            {formatTime(progress)} / {formatTime(duration)}
          </Text>
        </Flex>

        <Slider
          aria-label="Audio progress and seek"
          min={0}
          max={duration > 0 ? duration : 100}
          value={progress}
          onChange={handleSeek}
          isDisabled={isLoading}
          focusThumbOnChange={false}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb aria-label="Seek position" />
        </Slider>
      </Flex>
    </Box>
  );
}

/*
 * Extracts optional start and end from #t=10,20
 */
function parseMediaFragment(urlStr: string) {
  try {
    const urlObj = new URL(urlStr);
    const fragmentParams = new URLSearchParams(urlObj.hash.substring(1));
    const temporal = fragmentParams.get("t");

    if (!temporal) return { start: 0, end: null };

    const parts = temporal.split(",");
    const start = parseFloat(parts[0]);
    const end = parts[1] ? parseFloat(parts[1]) : null;

    return {
      start: !isNaN(start) ? start : 0,
      end: end && !isNaN(end) ? end : null,
    };
  } catch (e) {
    return { start: 0, end: null };
  }
}
