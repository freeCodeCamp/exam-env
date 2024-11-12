import { useEffect } from "react";

export function useDeviceCompatabilityCheck(cb: (reason: string) => void) {
  useEffect(() => {
    // Listen for various device features
    navigator.mediaDevices.addEventListener(
      "devicechange",
      deviceChangeListener
    );

    updateDeviceList();

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        deviceChangeListener
      );
    };
  }, []);

  function deviceChangeListener(e: Event) {
    console.log(e);
    updateDeviceList();
  }

  async function updateDeviceList() {
    const enumberatedDevices = await navigator.mediaDevices.enumerateDevices();
    const devices = enumberatedDevices.flat();
    const cameraPermission = await navigator.permissions.query({
      // @ts-expect-error "camera" does exist on PermissionName. The type is wrong.
      name: "camera",
    });
    if (cameraPermission.state !== "granted") {
      cb("Grant this app permission to use your camera");
    }
    const atLeastOneCamera = devices.some((d) => d.kind === "videoinput");
    if (!atLeastOneCamera) {
      cb("No Camera found!");
    }
  }
}
