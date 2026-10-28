/**
 * The 2.5-D / 3-D layer (react-three-fiber). Imported only through lazy renderers, so three.js is
 * a separate chunk that 2-D-only devices never download.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Vector3, type Group } from 'three';

/** Keeps `width` world units across the canvas, whatever its pixel size. */
function FitWidth({ width, minHeight }: { width: number; minHeight: number }) {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    camera.zoom = Math.min(size.width / width, size.height / minHeight);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, width, minHeight, invalidate]);
  return null;
}

/**
 * An orthographic, angled "table-top" scene. Renders on demand (only when something moves),
 * with a capped pixel ratio, to stay light on cheap phones.
 */
export function ThreeStage({
  children,
  width = 9,
  minHeight = 5,
  camera = [0, 6, 7],
  label,
}: {
  children: ReactNode;
  /** World units that must fit across. */
  width?: number;
  minHeight?: number;
  camera?: [number, number, number];
  label?: string;
}) {
  return (
    <Canvas
      orthographic
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: camera, zoom: 60, near: 0.1, far: 100 }}
      onCreated={({ camera: c }) => c.lookAt(0, 0, 0)}
      gl={{ antialias: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
      aria-label={label}
    >
      <FitWidth width={width} minHeight={minHeight} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[-4, 8, 5]} intensity={1.6} />
      {children}
    </Canvas>
  );
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * A group that flies to `to` in a little arc whenever `to` changes (items hopping onto plates).
 * Keeps requesting frames only while it moves.
 */
export function Mover({
  to,
  from,
  hop = 0.6,
  delay = 0,
  speed = 2.2,
  children,
}: {
  to: [number, number, number];
  from?: [number, number, number];
  hop?: number;
  delay?: number;
  speed?: number;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const anim = useRef({ start: from ?? to, end: to, t: from ? 0 : 1, wait: delay });
  const { invalidate } = useThree();
  const key = to.join(',');
  useEffect(() => {
    const g = ref.current;
    const a = anim.current;
    const cur: [number, number, number] = g ? [g.position.x, g.position.y, g.position.z] : a.end;
    if (cur.join(',') === key && a.t >= 1) return;
    anim.current = { start: cur, end: to, t: 0, wait: delay };
    invalidate();
    // `to` is compared by value through `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useFrame((_, dt) => {
    const g = ref.current;
    const a = anim.current;
    if (!g || a.t >= 1) return;
    if (a.wait > 0) {
      a.wait -= dt;
      invalidate();
      return;
    }
    a.t = Math.min(1, a.t + Math.min(dt, 0.05) * speed);
    const k = ease(a.t);
    g.position.set(
      a.start[0] + (a.end[0] - a.start[0]) * k,
      a.start[1] + (a.end[1] - a.start[1]) * k + Math.sin(Math.PI * a.t) * hop,
      a.start[2] + (a.end[2] - a.start[2]) * k,
    );
    invalidate();
  });
  const init = from ?? to;
  return (
    <group ref={ref} position={init}>
      {children}
    </group>
  );
}

/** Soft round shadow under an object; cheaper than real shadow maps. */
export function BlobShadow({
  r = 0.3,
  opacity = 0.18,
  y = 0.002,
}: {
  r?: number;
  opacity?: number;
  y?: number;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <circleGeometry args={[r, 20]} />
      <meshBasicMaterial color="#2B2B40" transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/**
 * A part's spot in a 3-D scene (see `SvgAnchor`): a 1-px DOM point beside the canvas, moved to the
 * projected position on every rendered frame.
 */
export function Anchor3D({ id, position }: { id: string; position: [number, number, number] }) {
  const { camera, size, gl } = useThree();
  const el = useMemo(() => {
    const span = document.createElement('span');
    span.dataset.kgAnchor = id;
    Object.assign(span.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '1px',
      height: '1px',
      pointerEvents: 'none',
    });
    return span;
  }, [id]);
  useLayoutEffect(() => {
    gl.domElement.parentElement?.appendChild(el);
    return () => el.remove();
  }, [gl, el]);
  const v = useMemo(() => new Vector3(), []);
  const [x, y, z] = position;
  useFrame(() => {
    v.set(x, y, z).project(camera);
    el.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
  });
  return null;
}
