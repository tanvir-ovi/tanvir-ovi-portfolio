"use client";

import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EEGSignalField } from "./EEGSignalField";

/*
 * A neural brain built on a REAL cortical surface.
 *
 * public/brain-points.json is baked from a real MRI-derived brain mesh: the
 * pial cortical surface (both hemispheres) plus the cerebellum and brainstem
 * (pons / medulla), so the whole silhouette reads as an anatomical brain.
 * Source mesh "Brain for Blender" by Anderson Winkler / brainder.org, CC BY-SA
 * 3.0 (see public/brain-points.LICENSE.txt). Because the geometry is pre-baked
 * into a static JSON, there is no runtime model loader that can fail - if the
 * fetch or WebGL ever fails, the hero falls back to the flat EEG signal field.
 *
 * Layers: a low-poly translucent surface shell (Fresnel x-ray glow) + a dense
 * point cloud on the true surface + bright "neurons" that fire, with signal
 * pulses hopping neuron to neuron and flashing each on arrival.
 *
 * The exact cortical point cloud forms the brain; a subset are "neurons" that
 * fire, with signal pulses hopping neuron to neuron along synapses and flashing
 * each on arrival. An interactive wireframe grid floor ripples beneath it and
 * reacts to the cursor - the "wave at the bottom" from auraEEG - spanning the
 * whole hero so the headline and the brain live in one 3D space.
 *
 * Choreography: opens centred and large, rotating to show its sides, then glides
 * to the right column and keeps slowly turning while the headline lands.
 */

export type PointerRef = RefObject<{ x: number; y: number }>;

type BrainJSON = {
  points: number[];
  neurons: number[];
  edges: number[];
  shell: { pos: number[]; idx: number[] };
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* Fresnel "x-ray" shader for the subtle translucent brain surface: bright at
 * grazing angles (the rim/folds), near-transparent face-on, so the whole thing
 * reads as a glowing membrane over the neuron cloud. */
const fresnelVert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const fresnelFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uOpacity;
  uniform float uInner;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
    float a = (f + uInner) * uOpacity;
    gl_FragColor = vec4(uColor * (f + uInner * 0.9), a);
  }
`;
function makeFresnelMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      // Crisp rim (high power) reads the anatomical outline and the folded
      // cortex ridges; low inner fill keeps the interior calm, not a glowing blob.
      uColor: { value: new THREE.Color("#63c4ef") },
      uPower: { value: 3.4 },
      uOpacity: { value: 0.5 },
      uInner: { value: 0.012 },
    },
    vertexShader: fresnelVert,
    fragmentShader: fresnelFrag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ---- Interactive grid floor ---- */
const gridVert = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uReveal;
  varying float vE;
  varying float vFade;
  void main() {
    vec3 p = position;
    float w = sin(p.x * 0.55 + uTime * 0.8) * 0.16 + cos(p.z * 0.5 + uTime * 0.65) * 0.16;
    float d = distance(p.xz, uMouse);
    w += exp(-d * d * 0.14) * 0.6 * sin(uTime * 2.4 - d * 1.8);
    p.y += w * uReveal;
    vE = w;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vFade = (1.0 - smoothstep(4.5, 11.0, -mv.z)) * (1.0 - smoothstep(4.0, 5.4, abs(p.x))) * uReveal;
    gl_PointSize = clamp(95.0 / -mv.z, 1.0, 6.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const gridFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying float vE;
  varying float vFade;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    float b = 0.35 + clamp(vE, 0.0, 1.0) * 1.0;
    gl_FragColor = vec4(uColor * b, glow * 0.8 * vFade);
  }
`;

function GridFloor({ pointer }: { pointer: PointerRef }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geo = useMemo(() => {
    const cols = 72;
    const rows = 46;
    const pos: number[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i / (cols - 1) - 0.5) * 10;
        const z = (j / (rows - 1)) * 9 - 4.5;
        pos.push(x, 0, z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uReveal: { value: 0 },
          uColor: { value: new THREE.Color("#38bdf8") },
        },
        vertexShader: gridVert,
        fragmentShader: gridFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    const m = matRef.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    m.uniforms.uTime.value += dt;
    m.uniforms.uReveal.value = Math.min(1, m.uniforms.uReveal.value + dt * 0.5);
    const t = pointer.current ?? { x: 0, y: 0 };
    const mu = m.uniforms.uMouse.value as THREE.Vector2;
    mu.x += (t.x * 4.5 - mu.x) * Math.min(1, dt * 3);
    mu.y += (-t.y * 4 + 1.5 - mu.y) * Math.min(1, dt * 3);
  });

  return (
    <points geometry={geo} position={[0, -1.75, 0]}>
      <primitive object={mat} ref={matRef} attach="material" />
    </points>
  );
}

const PULSE_COUNT = 5;
type PulseState = { edge: number; t: number; speed: number; dir: 0 | 1 };

function BrainScene({
  data,
  pointer,
  variant,
}: {
  data: BrainJSON;
  pointer: PointerRef;
  variant: "desktop" | "mobile";
}) {
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  const pulseSprites = useRef<(THREE.Sprite | null)[]>([]);
  const flashSprites = useRef<(THREE.Sprite | null)[]>([]);
  const glowTex = useMemo(() => makeGlowTexture(), []);

  const built = useMemo(() => {
    const denseGeo = new THREE.BufferGeometry();
    denseGeo.setAttribute("position", new THREE.Float32BufferAttribute(data.points, 3));

    const brightGeo = new THREE.BufferGeometry();
    brightGeo.setAttribute("position", new THREE.Float32BufferAttribute(data.neurons, 3));

    const neuronsV: THREE.Vector3[] = [];
    for (let i = 0; i < data.neurons.length; i += 3) {
      neuronsV.push(new THREE.Vector3(data.neurons[i], data.neurons[i + 1], data.neurons[i + 2]));
    }

    const edgeList: { a: number; b: number }[] = [];
    const edgePos: number[] = [];
    for (let i = 0; i < data.edges.length; i += 2) {
      const a = data.edges[i];
      const b = data.edges[i + 1];
      edgeList.push({ a, b });
      const va = neuronsV[a];
      const vb = neuronsV[b];
      edgePos.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePos, 3));

    // Which edges touch each neuron, for signal hopping
    const incident: number[][] = neuronsV.map(() => []);
    edgeList.forEach((e, k) => {
      incident[e.a].push(k);
      incident[e.b].push(k);
    });

    // Translucent surface shell (decimated real brain mesh)
    const shellGeo = new THREE.BufferGeometry();
    shellGeo.setAttribute("position", new THREE.Float32BufferAttribute(data.shell.pos, 3));
    shellGeo.setIndex(data.shell.idx);
    shellGeo.computeVertexNormals();

    return { denseGeo, brightGeo, edgeGeo, shellGeo, neuronsV, edgeList, incident };
  }, [data]);

  const shellMat = useMemo(() => makeFresnelMaterial(), []);
  // The neuron material's opacity is animated for a slow shimmer; it is attached
  // as a JSX child so its ref is set after mount and read only in the frame loop.
  const brightMatRef = useRef<THREE.PointsMaterial>(null);

  // Dim, fine cortical points suggesting surface texture - not a bright cloud
  const denseMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#59a6d2"),
        size: 0.016,
        map: glowTex,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [glowTex]
  );
  // A whisper of additive haze for depth only (no blooming blob)
  const hazeMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#38bdf8"),
        size: 0.045,
        map: glowTex,
        transparent: true,
        opacity: 0.045,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [glowTex]
  );
  const edgeMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#38bdf8"),
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const state = useRef({
    clock: 0,
    spin: 0,
    tiltX: 0,
    tiltY: 0,
    pulses: Array.from({ length: PULSE_COUNT }, (_, i): PulseState => ({
      edge: built.edgeList.length ? i % built.edgeList.length : 0,
      t: (i * 0.17) % 1,
      speed: 0.26 + (i % 3) * 0.08,
      dir: 0,
    })),
    flashes: Array.from({ length: PULSE_COUNT }, () => ({ life: 0, pos: new THREE.Vector3() })),
  });

  const INTRO = 2.8;

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = state.current;
    s.clock += delta;
    const g = group.current;
    if (!g) return;

    const p = Math.min(s.clock / INTRO, 1);
    const e = easeInOutCubic(p);

    // Desktop: glide from centre to the right column while the headline lands.
    // Mobile: a staged intro - the brain opens large and centred, slow-zooming
    // and rotating for a beat, then eases down into the lower half as the text
    // reveals in the space above it.
    if (variant === "mobile") {
      const fit = Math.min(1.18, Math.max(0.72, viewport.width / 2.7));
      const HOLD = 2.6;
      const SETTLE = 2.3;
      const zoom = Math.min(1, s.clock / HOLD);
      const zoomE = 1 - Math.pow(1 - zoom, 3); // easeOutCubic
      const sp = Math.min(1, Math.max(0, (s.clock - HOLD) / SETTLE));
      const se = easeInOutCubic(sp);
      g.position.x = 0;
      g.position.y = 0.35 - se * 1.55; // centred, then down clear of the copy
      g.scale.setScalar(fit * (0.9 + 0.26 * zoomE - se * 0.22));
    } else {
      const xRight = viewport.width * 0.22;
      g.position.x = e * xRight;
      g.position.y = 0.12;
      g.scale.setScalar(1.62 - e * 0.58);
    }

    // Slow, elegant drift (no chaotic motion)
    const introSpin = variant === "mobile" ? Math.min(1, s.clock / 3.4) : e;
    s.spin += delta * (introSpin < 1 ? 0.7 - 0.6 * introSpin : 0.075);

    const target = pointer.current ?? { x: 0, y: 0 };
    s.tiltX += (target.y * 0.12 - s.tiltX) * Math.min(1, delta * 2.5);
    s.tiltY += (target.x * 0.22 - s.tiltY) * Math.min(1, delta * 2.5);

    g.rotation.y = -2.2 + e * 2.2 + s.spin + s.tiltY;
    g.rotation.x = 0.06 + Math.sin(s.clock * 0.22) * 0.03 + s.tiltX;

    // Gentle shimmer: a slow breath of brightness across nodes and the shell
    // Gentle shimmer on the neurons only (the shell stays calm)
    const shimmer = 0.5 + 0.5 * Math.sin(s.clock * 0.7);
    if (brightMatRef.current) brightMatRef.current.opacity = 0.46 + 0.18 * shimmer;

    const { edgeList, neuronsV, incident } = built;
    if (edgeList.length > 0) {
      s.pulses.forEach((pulse, i) => {
        pulse.t += delta * pulse.speed;
        const mesh = pulseSprites.current[i];
        if (!mesh) return;

        const edge = edgeList[pulse.edge];
        const fromIdx = pulse.dir === 0 ? edge.a : edge.b;
        const toIdx = pulse.dir === 0 ? edge.b : edge.a;

        if (pulse.t >= 1) {
          const arrival = neuronsV[toIdx];
          const flash = s.flashes[i];
          flash.life = 1;
          flash.pos.copy(arrival);

          const options = incident[toIdx].filter((k) => k !== pulse.edge);
          const nextEdge =
            options.length > 0
              ? options[Math.floor(Math.random() * options.length)]
              : Math.floor(Math.random() * edgeList.length);
          const ne = edgeList[nextEdge];
          pulse.dir = ne.a === toIdx ? 0 : 1;
          pulse.edge = nextEdge;
          pulse.t = 0;
        } else {
          mesh.position.lerpVectors(neuronsV[fromIdx], neuronsV[toIdx], pulse.t);
          const swell = 0.5 + 0.7 * Math.sin(pulse.t * Math.PI);
          mesh.scale.setScalar(swell * 0.118);
        }

        const flash = s.flashes[i];
        const fm = flashSprites.current[i];
        if (fm) {
          flash.life = Math.max(0, flash.life - delta * 1.7);
          fm.position.copy(flash.pos);
          fm.scale.setScalar(0.08 + (1 - flash.life) * 0.32);
          (fm.material as THREE.SpriteMaterial).opacity = flash.life * 0.55;
        }
      });
    }
  });

  return (
    <>
      <group ref={group}>
        {/* Subtle translucent brain surface hugging the neuron cloud */}
        <mesh geometry={built.shellGeo} material={shellMat} scale={1.008} />
        <points geometry={built.denseGeo} material={hazeMat} />
        <points geometry={built.denseGeo} material={denseMat} />
        <points geometry={built.brightGeo}>
          <pointsMaterial
            ref={brightMatRef}
            map={glowTex}
            color="#a6d8f2"
            size={0.038}
            transparent
            opacity={0.62}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
        <lineSegments geometry={built.edgeGeo} material={edgeMat} />

        {/* Faint core glow for depth only */}
        <sprite scale={2.9} position={[0, 0, -0.1]}>
          <spriteMaterial
            map={glowTex}
            color="#0c2136"
            transparent
            opacity={0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {Array.from({ length: PULSE_COUNT }).map((_, i) => (
          <sprite
            key={`p${i}`}
            ref={(m) => {
              pulseSprites.current[i] = m;
            }}
            scale={0.095}
          >
            <spriteMaterial
              map={glowTex}
              color="#b8a7ff"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        ))}
        {Array.from({ length: PULSE_COUNT }).map((_, i) => (
          <sprite
            key={`f${i}`}
            ref={(m) => {
              flashSprites.current[i] = m;
            }}
            scale={0.1}
          >
            <spriteMaterial
              map={glowTex}
              color="#9d8bff"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        ))}
      </group>

      <GridFloor pointer={pointer} />
    </>
  );
}

class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function NeuralBrain({
  pointer,
  variant = "desktop",
}: {
  pointer: PointerRef;
  variant?: "desktop" | "mobile";
}) {
  const [data, setData] = useState<BrainJSON | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/brain-points.json")
      .then((r) => r.json())
      .then((d: BrainJSON) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const fallback = (
    <div className="absolute right-0 top-1/2 h-[72svh] max-h-[620px] w-1/2 -translate-y-1/2">
      <EEGSignalField />
    </div>
  );

  if (failed) return fallback;
  if (!data) return null;

  return (
    <WebGLBoundary fallback={fallback}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="!pointer-events-none"
      >
        <BrainScene data={data} pointer={pointer} variant={variant} />
      </Canvas>
    </WebGLBoundary>
  );
}
