import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

export type AppFocusProps = {
  onFocusChanged: (focused: boolean) => void;
};

/**
 * A hook to attach a callback for whenever the app window's focus changes.
 *
 * As the focus event handler is immediately attached, a ref can be used to prevent always running on focus changes and prevent unnecessary rerenders.
 *
 * **Usage**
 *
 * ```tsx
 * function myComponent() {
 *   const runFocusRef = useRef(false);
 *
 *   function onFocusChanged(focused: boolean) {
 *     if (runFocusRef.current) {
 *       console.log(focused);
 *     }
 *   }
 *   useAppFocus({onFocusChanged});
 *
 *   return (
 *     <button
 *       onClick={() => {
 *         runFocusRef.current = !runFocusRef.current;
 *       }}
 *     >
 *       Toogle focus runner
 *     </button>
 *   );
 * }
 * ```
 *
 * TODO: Consider returning `listen` and `unlisten` functions
 *
 */
export function useAppFocus({ onFocusChanged }: AppFocusProps) {
  // TODO: Once useEffectiveEvent is stabalised
  // const onChange = useEffectiveEvent(onFocusChanged);

  async function listen() {
    const unlisten = await getCurrentWindow().onFocusChanged(
      ({ payload: focused }) => {
        onFocusChanged(focused);
      }
    );

    return unlisten;
  }

  useEffect(() => {
    // TODO: What to do if unlisten function is not yet attached to ref?
    const unlisten = listen();

    return () => {
      // If component is unmounted, listener MUST be unlistened
      unlisten?.then((u) => u());
    };
  }, [onFocusChanged]);
}
