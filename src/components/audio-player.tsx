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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FullQuestion } from "../utils/types";

interface AudioPlayerProps {
  fullQuestion: FullQuestion;
}

export function AudioPlayer({ fullQuestion }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!fullQuestion.audio) {
      return;
    }
    audioRef.current = new Audio(fullQuestion.audio.url);
    setIsPlaying(false);
    setProgress(0);

    audioRef.current.onloadedmetadata = onLoadedMetadata;
    audioRef.current.ontimeupdate = onTimeUpdate;
    audioRef.current.onpause = onPause;
    audioRef.current.onplay = onPlay;

    return () => {
      if (!audioRef.current) {
        return;
      }
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, [fullQuestion]);

  function onLoadedMetadata() {
    if (!audioRef.current) {
      return;
    }
    const d = audioRef.current.duration;
    if (typeof d !== "number") {
      return;
    }
    setDuration(d);
  }

  function onTimeUpdate() {
    if (!audioRef.current) {
      return;
    }
    const currentTime = audioRef.current.currentTime;
    if (typeof currentTime !== "number") {
      return;
    }
    setProgress(currentTime);
  }

  function onPause() {
    setIsPlaying(false);
  }

  function onPlay() {
    setIsPlaying(true);
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  function handleSeek(value: number) {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.currentTime = value;
    setProgress(value);
  }

  function formatTime(time: unknown): string {
    if (typeof time !== "number") {
      // Somehow, `audioRef.current.currentTime` can be unset
      return "0:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  if (!audioRef.current || !fullQuestion.audio) {
    return null;
  }

  return (
    <Box>
      <Flex direction="column">
        <Flex alignItems="center">
          <Button onClick={togglePlay}>
            {isPlaying ? "| |" : <TriangleUpIcon style={{ rotate: "90deg" }} />}
          </Button>
          <Text ml={2}>
            {formatTime(audioRef.current.currentTime)} / {formatTime(duration)}
          </Text>
        </Flex>

        <Slider
          aria-label="slider-ex-1"
          min={0}
          max={duration}
          value={progress}
          onChange={(val) => handleSeek(val)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Flex>
    </Box>
  );
}
