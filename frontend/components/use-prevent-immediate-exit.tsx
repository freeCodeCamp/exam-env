import { CloseRequestedEvent, getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

/**
 * A hook to attach a callback for whenever the app window is requested to close.
 *
 * As the focus event handler is immediately attached, a ref can be used to prevent always running on many requests and prevent unnecessary rerenders.
 *
 * **Usage**
 *
 * ```tsx
 * function myComponent() {
 *   const closeListenerHasBeenInitiated = useRef(false);
 *
 *   function onCloseRequested(event: CloseRequestedEvent) {
 *     if (closeListenerHasBeenInitiated.current) {
 *       console.log(focused);
 *     }
 *   }
 *   usePreventImmediateExit({onCloseRequested});
 *
 *   return (
 *     <button
 *       onClick={() => {
 *         closeListenerHasBeenInitiated.current = !closeListenerHasBeenInitiated.current;
 *       }}
 *     >
 *       Close Window
 *     </button>
 *   );
 * }
 * ```
 *
 * TODO: Consider returning `listen` and `unlisten` functions
 *
 */
export function usePreventImmediateExit({
  onCloseRequested,
}: {
  onCloseRequested: (e: CloseRequestedEvent) => Promise<void> | void;
}) {
  // TODO: Once useEffectiveEvent is stabalised
  // const onChange = useEffectiveEvent(onCloseRequested);

  async function listen() {
    const unlisten = await getCurrentWindow().onCloseRequested(
      async (event) => {
        await onCloseRequested(event);
      }
    );
    return unlisten;
  }

  useEffect(() => {
    // TODO: What to do if unlisten function is not yet attached to ref?
    const unlisten = listen();

    return () => {
      // If component is unmounted, listener MUST be unlistened
      unlisten?.then((u) => {
        u();
      });
    };
  }, []);
}
