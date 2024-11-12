import { useEffect, useRef, VideoHTMLAttributes } from "react";

type CameraProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "onPause"> & {
  constraints?: {
    video?: boolean;
    audio?: boolean;
  };
};

/**
 * A component to use camera hardware to stream the media into a video element.
 *
 * Accepts all attributes passed to `video` elements.
 *
 * Use `on<event_name>` hooks to tap into events around video. \
 * **NOTE:** Do NOT overwrite `onPause` function.
 */
export function Camera({ constraints, ...rest }: CameraProps) {
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
        // Look into adding event listener for video.
        // Event "suspend" is emitted if permissions are revoked for camera
      }
    } catch (err) {
      // TODO: Do something with error
      console.error("Error accessing camera: ", err);
      alert("TODO: Camera not accessibile.");
    }
  }

  useEffect(() => void startCamera(), []);

  return <video ref={videoRef} {...rest}></video>;
}
