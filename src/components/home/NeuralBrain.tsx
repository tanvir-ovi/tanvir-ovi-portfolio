"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EEGSignalField } from "./EEGSignalField";

export type PointerRef = RefObject<{ x: number; y: number }>;
type BrainSurface = { positions: Float32Array; shades: Float32Array; indices: Uint32Array };

// MRI-derived pial hemispheres, cerebellum and brainstem by Anderson Winkler.
// CC BY-SA 3.0; see brain-surface.LICENSE.txt for attribution and binary format.
function decodeSurface(buffer: ArrayBuffer): BrainSurface {
  const view = new DataView(buffer);
  if (buffer.byteLength < 16 || view.getUint32(0, true) !== 0x314e5242) throw new Error("Invalid brain surface");
  const count = view.getUint32(4, true), indexCount = view.getUint32(8, true);
  if (16 + count * 16 + indexCount * 4 !== buffer.byteLength) throw new Error("Incomplete brain surface");
  const packed = new Float32Array(buffer, 16, count * 4);
  const positions = new Float32Array(count * 3), shades = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions.set(packed.subarray(i * 4, i * 4 + 3), i * 3);
    shades[i] = packed[i * 4 + 3];
  }
  return { positions, shades, indices: new Uint32Array(buffer, 16 + count * 16, indexCount) };
}

const gridVertex = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vLight;
  varying float vFade;
  void main() {
    vec3 p = position;
    float d = distance(p.xz, uMouse);
    float wave = sin(p.x * 0.55 + uTime * 0.8) * 0.16 + cos(p.z * 0.5 + uTime * 0.65) * 0.16;
    wave += exp(-d * d * 0.14) * 0.6 * sin(uTime * 2.4 - d * 1.8);
    p.y += wave;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vLight = 0.3 + max(wave, 0.0);
    vFade = (1.0 - smoothstep(4.5, 11.0, -mv.z)) * (1.0 - smoothstep(4.0, 5.4, abs(p.x)));
    gl_PointSize = clamp(70.0 / -mv.z, 1.0, 4.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const gridFragment = `
  varying float vLight;
  varying float vFade;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    gl_FragColor = vec4(vec3(0.12, 0.57, 0.86) * vLight, (1.0 - smoothstep(0.0, 0.5, d)) * 0.65 * vFade);
  }
`;

function GridFloor({ pointer }: { pointer: PointerRef }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const positions = useMemo(() => {
    const points = [];
    for (let x = 0; x < 72; x++) for (let z = 0; z < 46; z++) points.push((x / 71 - 0.5) * 10, 0, z / 45 * 9 - 4.5);
    return new Float32Array(points);
  }, []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() } }), []);
  useFrame((_, delta) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value += Math.min(delta, 0.05);
    const ease = 1 - Math.exp(-3 * Math.min(delta, 0.05));
    const mouse = m.uniforms.uMouse.value as THREE.Vector2;
    mouse.x += (pointer.current.x * 4.5 - mouse.x) * ease;
    mouse.y += (-pointer.current.y * 4 + 1.5 - mouse.y) * ease;
  });
  return (
    <points position={[0, -1.75, 0]}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={gridVertex} fragmentShader={gridFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function BrainScene({ data, pointer, variant }: { data: BrainSurface; pointer: PointerRef; variant: "desktop" | "mobile" }) {
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  const signalMaterial = useRef<THREE.ShaderMaterial>(null);
  const state = useRef({ time: 0, spin: 0, tiltX: 0, tiltY: 0 });
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    g.setIndex(new THREE.BufferAttribute(data.indices, 1));
    g.computeVertexNormals();
    const colors = new Float32Array(data.positions.length);
    for (let i = 0; i < data.shades.length; i++) colors.set([data.shades[i], data.shades[i], data.shades[i]], i * 3);
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [data]);
  const signals = useMemo(() => {
    const positions = [], phases = [];
    const normals = geometry.getAttribute("normal");
    // Surface lights are depth-tested: the solid cortex hides far-side points.
    for (let i = 83; i < data.shades.length; i += 733) {
      if (data.shades[i] < 0.72) continue;
      positions.push(data.positions[i * 3] + normals.getX(i) * 0.006, data.positions[i * 3 + 1] + normals.getY(i) * 0.006, data.positions[i * 3 + 2] + normals.getZ(i) * 0.006);
      phases.push(i * 0.731);
    }
    return { positions: new Float32Array(positions), phases: new Float32Array(phases) };
  }, [data, geometry]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05), s = state.current, g = group.current;
    if (!g) return;
    s.time += delta;
    const p = Math.min(s.time / 2.8, 1);
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    if (variant === "mobile") {
      const fit = Math.min(1.35, viewport.width / 3.0, viewport.height / 2.9);
      const settle = Math.min(1, Math.max(0, (s.time - 1.1) / 2.0));
      const ease = 1 - Math.pow(1 - settle, 3);
      g.position.set(0, 0.2 - ease * 0.12, 0);
      g.scale.setScalar(fit * (1.1 - ease * 0.1));
    } else {
      g.position.set(viewport.width * 0.23 * (0.86 + e * 0.14), 0.12, 0);
      g.scale.setScalar(0.99 - e * 0.09);
    }
    s.spin += delta * (p < 1 ? 0.55 - e * 0.48 : 0.055);
    const ease = 1 - Math.exp(-3 * delta);
    s.tiltX += (pointer.current.y * 0.2 - s.tiltX) * ease;
    s.tiltY += (pointer.current.x * 0.42 - s.tiltY) * ease;
    g.rotation.set(0.10 + Math.sin(s.time * 0.22) * 0.025 + s.tiltX, -1.7 + e * 1.22 + s.spin + s.tiltY, -0.035);
    if (signalMaterial.current) signalMaterial.current.uniforms.uTime.value = s.time;
  });

  return (
    <>
      <hemisphereLight args={["#b6dbf0", "#172139", 1.25]} />
      <directionalLight position={[-3, 5, 5]} color="#deefff" intensity={2.6} />
      <directionalLight position={[4, 1, -3]} color="#26bded" intensity={2.1} />
      <directionalLight position={[1, -2, 3]} color="#8e82ed" intensity={0.65} />
      <group ref={group}>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#6890aa" vertexColors roughness={0.55} metalness={0.18} emissive="#071321" emissiveIntensity={0.12} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[signals.positions, 3]} />
            <bufferAttribute attach="attributes-phase" args={[signals.phases, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={signalMaterial} uniforms={uniforms} transparent depthWrite={false}
            vertexShader={`
              attribute float phase;
              uniform float uTime;
              varying float vPulse;
              void main() {
                vPulse = pow(0.5 + 0.5 * sin(uTime * 1.4 + phase), 5.0);
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = (9.0 + 8.0 * vPulse) / -mv.z;
                gl_Position = projectionMatrix * mv;
              }
            `}
            fragmentShader={`
              varying float vPulse;
              void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                if(d > 0.5) discard;
                gl_FragColor = vec4(mix(vec3(0.3, 0.7, 1.0), vec3(0.83, 0.8, 1.0), vPulse), (1.0 - smoothstep(0.05, 0.5, d)) * (0.25 + vPulse * 0.75));
              }
            `}
          />
        </points>
      </group>
      <GridFloor pointer={pointer} />
    </>
  );
}

class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function NeuralBrain({ pointer, variant = "desktop" }: { pointer: PointerRef; variant?: "desktop" | "mobile" }) {
  const host = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<BrainSurface | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/brain-surface.bin", { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error("Brain unavailable"); return r.arrayBuffer(); })
      .then((buffer) => setData(decodeSurface(buffer)))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  const fallback = <div className="absolute inset-x-0 bottom-0 h-[40svh] lg:inset-x-auto lg:right-0 lg:top-1/2 lg:h-[65svh] lg:w-1/2 lg:-translate-y-1/2"><EEGSignalField /></div>;
  return (
    <div ref={host} className="absolute inset-0">
      {failed ? fallback : data ? (
        <WebGLBoundary fallback={fallback}>
          <Canvas dpr={variant === "mobile" ? [1, 1.25] : [1, 1.75]} frameloop={active ? "always" : "never"} camera={{ position: [0, 0, 5.2], fov: 45 }} gl={{ antialias: true, alpha: true }} className="!pointer-events-none">
            <BrainScene data={data} pointer={pointer} variant={variant} />
          </Canvas>
        </WebGLBoundary>
      ) : null}
    </div>
  );
}
