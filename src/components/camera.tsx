import { useEffect, useRef, VideoHTMLAttributes } from "react";

type CameraProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "onPause"> & {
  constraints?: {
    video?: boolean;
    audio?: boolean;
  };
  onUserMediaSetupError: (err: unknown) => void;
};

/**
 * A component to use camera hardware to stream the media into a video element.
 *
 * Accepts all attributes passed to `video` elements.
 *
 * Use `on<event_name>` hooks to tap into events around video. \
 * **NOTE:** Do NOT overwrite `onPause` function.
 */
export function Camera({
  constraints,
  onUserMediaSetupError,
  ...rest
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || { video: true }
      );
      const video = videoRef.current;

      if (video) {
        video.srcObject = stream;
        // Video is "paused" when component is unmounted :shrug:
        video.onpause = () => {
          video.srcObject = null;
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        };
        // Event "suspend" is emitted if permissions are revoked for camera
        video.onsuspend = (e) => {
          console.log(e);
          onUserMediaSetupError("Camera is unavailable.");
        };
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      onUserMediaSetupError(err);
    }
  }

  useEffect(() => void startCamera(), []);

  return <video ref={videoRef} {...rest}></video>;
}
