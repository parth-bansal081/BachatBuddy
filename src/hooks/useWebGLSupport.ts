import { useState, useEffect } from "react";

export function useWebGLSupport() {
  const [supported, setSupported] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
    setChecked(true);
  }, []);

  return { supported, checked };
}