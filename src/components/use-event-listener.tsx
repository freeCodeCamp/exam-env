import { EventCallback, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

/**
 * A hook to attach a callback for whenever the specified event is emitted.
 *
 * **Usage**
 *
 * ```tsx
 * type MyEventType = {
 *   name: string
 * };
 *
 * function myComponent() {
 *   const onEvent: EventCallback<MyEventType> = (e) => {
 *     console.log(e); // { payload: { name: "" } }
 *   }
 *   useEventListener("some-event", onEvent);
 *
 *   return (
 *     <h1>Hi</h1>
 *   );
 * }
 * ```
 */
export function useEventListener<T>(
  eventName: string,
  onEvent: EventCallback<T>
) {
  // TODO: Once useEffectiveEvent is stabalised
  // const onChange = useEffectiveEvent(onCloseRequested);

  async function prepListen() {
    const unlisten = await listen<T>(eventName, onEvent);
    return unlisten;
  }

  useEffect(() => {
    // TODO: What to do if unlisten function is not yet attached to ref?
    const unlisten = prepListen();

    return () => {
      // If component is unmounted, listener MUST be unlistened
      unlisten?.then((u) => u());
    };
  }, []);
}
