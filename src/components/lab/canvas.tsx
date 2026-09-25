'use client';

import {
  createContext,
  Suspense,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color, SRGBColorSpace } from 'three';

const ReadyContext = createContext<() => void>(() => undefined);

export function useMarkReady() {
  return use(ReadyContext);
}

function hasWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!context;
  } catch {
    return false;
  }
}

type LabCanvasProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function LabCanvas({ children, fallback }: LabCanvasProps) {
  const [webgl] = useState(hasWebGL);
  const [ready, setReady] = useState(false);

  return (
    <>
      <div className={ready ? 'invisible' : undefined}>{fallback}</div>
      {webgl ? (
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          orthographic
          flat
          camera={{ position: [0, 0, 10], zoom: 1 }}
          gl={{ antialias: false, powerPreference: 'low-power' }}
          className="text-accent"
          style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
        >
          <AdaptiveDpr />
          <ReadyContext value={() => setReady(true)}>
            <Suspense fallback={null}>{children}</Suspense>
          </ReadyContext>
        </Canvas>
      ) : (
        <p className="text-fg-muted absolute inset-x-0 bottom-4 text-center font-mono text-xs">
          WebGL is unavailable here, so this is the plain wordmark.
        </p>
      )}
    </>
  );
}

const SAMPLE_FRAMES = 60;
const SLOW_FRAME = 1 / 45;

function AdaptiveDpr() {
  const dpr = useThree((state) => state.viewport.dpr);
  const setDpr = useThree((state) => state.setDpr);
  const sample = useRef({ frames: 0, time: 0 });

  useFrame((_, delta) => {
    if (dpr <= 1 || delta > 0.05) return;
    sample.current.frames += 1;
    sample.current.time += delta;
    if (sample.current.frames < SAMPLE_FRAMES) return;
    if (sample.current.time / SAMPLE_FRAMES > SLOW_FRAME) setDpr(1);
    sample.current = { frames: 0, time: 0 };
  });

  return null;
}

// Reads the resolved accent and ink off the canvas so theme and hue changes follow.
export function useSceneColors(apply: (accent: Color, ink: Color) => void) {
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const onColors = useEffectEvent(apply);

  useEffect(() => {
    const probe = document.createElement('canvas').getContext('2d', {
      willReadFrequently: true,
    });
    if (!probe) return;
    const accent = new Color();
    const ink = new Color();

    const toColor = (css: string, target: Color) => {
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = css;
      probe.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
      target.setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
    };

    const read = () => {
      toColor(getComputedStyle(canvas).color, accent);
      toColor(getComputedStyle(document.body).color, ink);
      onColors(accent, ink);
      invalidate();
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style'],
    });
    return () => {
      observer.disconnect();
    };
  }, [canvas, invalidate]);
}
