"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PULSE_COUNT = 8;
const SEGMENTS = 14;
type Edge = { a: number; b: number; curve: THREE.QuadraticBezierCurve3 };

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.12, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.22)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// A deliberately sparse illustrative network inside the MRI-derived envelope.
// These are art-directed signal paths, not measured neurons or tractography.
function buildNetwork(surface: Float32Array) {
  const nodes: THREE.Vector3[] = [];
  const count = surface.length / 3;
  for (let n = 0; n < 2800 && nodes.length < 150; n++) {
    const i = ((n * 7919 + 53) % count) * 3;
    const p = new THREE.Vector3(surface[i] * 0.84, surface[i + 1] * 0.84 + 0.04, surface[i + 2] * 0.84);
    if (p.y < -0.68 || nodes.some((v) => v.distanceToSquared(p) < 0.033)) continue;
    nodes.push(p);
  }
  // A descending path keeps activity visible through the lower brainstem.
  const stemStart = nodes.length;
  for (const p of [[0.30, -0.40, 0], [0.36, -0.64, 0], [0.42, -0.87, 0], [0.48, -1.09, 0], [0.52, -1.30, 0]]) {
    nodes.push(new THREE.Vector3(p[0], p[1], p[2]));
  }
  const edges: Edge[] = [], keys = new Set<string>();
  const connect = (a: number, b: number) => {
    const key = [Math.min(a, b), Math.max(a, b)].join(":");
    if (keys.has(key)) return;
    keys.add(key);
    const middle = nodes[a].clone().lerp(nodes[b], 0.5);
    middle.x *= 0.94;
    middle.z *= 0.82;
    edges.push({ a, b, curve: new THREE.QuadraticBezierCurve3(nodes[a], middle, nodes[b]) });
  };
  nodes.forEach((p, a) => {
    nodes.map((v, b) => ({ b, d: v.distanceToSquared(p) }))
      .filter(({ b, d }) => a !== b && d < 0.55)
      .sort((u, v) => u.d - v.d).slice(0, 3).forEach(({ b }) => connect(a, b));
  });
  for (let i = stemStart; i < nodes.length - 1; i++) connect(i, i + 1);
  const incident: number[][] = nodes.map(() => []);
  const positions: number[] = [], edgeIds: number[] = [], progress: number[] = [];
  edges.forEach((edge, id) => {
    incident[edge.a].push(id);
    incident[edge.b].push(id);
    for (let s = 0; s < SEGMENTS; s++) {
      for (const t of [s / SEGMENTS, (s + 1) / SEGMENTS]) {
        const point = edge.curve.getPoint(t);
        positions.push(point.x, point.y, point.z);
        edgeIds.push(id);
        progress.push(t);
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("edgeId", new THREE.Float32BufferAttribute(edgeIds, 1));
  geometry.setAttribute("progress", new THREE.Float32BufferAttribute(progress, 1));
  const nodeGeometry = new THREE.BufferGeometry().setFromPoints(nodes);
  return { nodes, edges, incident, geometry, nodeGeometry, stemStart };
}

export function NeuralSignalNetwork({ surface }: { surface: Float32Array }) {
  const graph = useMemo(() => buildNetwork(surface), [surface]);
  const texture = useMemo(() => glowTexture(), []);
  const lines = useRef<THREE.ShaderMaterial>(null);
  const heads = useRef<(THREE.Sprite | null)[]>([]);
  const flashes = useRef<(THREE.Sprite | null)[]>([]);
  const uniforms = useMemo(() => ({ uPulses: { value: Array.from({ length: PULSE_COUNT }, () => new THREE.Vector3(-1, 0, 1)) } }), []);
  const state = useRef(Array.from({ length: PULSE_COUNT }, (_, i) => ({
    edge: i === 0 ? Math.max(0, graph.edges.findIndex((e) => e.a === graph.stemStart && e.b === graph.stemStart + 1)) : (i * 37) % graph.edges.length,
    t: i * 0.117, direction: 1, hops: i, life: 0, arrival: new THREE.Vector3(),
  })));
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.08);
    state.current.forEach((pulse, i) => {
      let edge = graph.edges[pulse.edge];
      const length = graph.nodes[edge.a].distanceTo(graph.nodes[edge.b]);
      pulse.t += dt * (0.16 + i * 0.012) / Math.max(0.18, length);
      if (pulse.t >= 1) {
        const arrival = pulse.direction === 1 ? edge.b : edge.a;
        pulse.arrival.copy(graph.nodes[arrival]);
        pulse.life = 1;
        const options = graph.incident[arrival].filter((e) => e !== pulse.edge);
        if (options.length) pulse.edge = options[(++pulse.hops * 7 + i) % options.length];
        edge = graph.edges[pulse.edge];
        pulse.direction = edge.a === arrival ? 1 : -1;
        pulse.t = 0;
      }
      const t = pulse.direction === 1 ? pulse.t : 1 - pulse.t;
      const head = heads.current[i];
      if (head) {
        edge.curve.getPoint(t, head.position);
        head.scale.setScalar(0.12 + 0.025 * Math.sin(pulse.t * Math.PI));
      }
      const packed = lines.current?.uniforms.uPulses.value as THREE.Vector3[] | undefined;
      packed?.[i].set(pulse.edge, t, pulse.direction);
      pulse.life = Math.max(0, pulse.life - dt * 1.9);
      const flash = flashes.current[i];
      if (flash) {
        flash.position.copy(pulse.arrival);
        flash.scale.setScalar(0.09 + (1 - pulse.life) * 0.18);
        (flash.material as THREE.SpriteMaterial).opacity = pulse.life * 0.65;
      }
    });
  });

  return (
    <group>
      <lineSegments geometry={graph.geometry}>
        <shaderMaterial ref={lines} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}
          vertexShader={`
            attribute float edgeId;
            attribute float progress;
            varying float vEdge;
            varying float vProgress;
            void main() {
              vEdge = edgeId; vProgress = progress;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uPulses[${PULSE_COUNT}];
            varying float vEdge;
            varying float vProgress;
            void main() {
              float signal = 0.0;
              for(int i = 0; i < ${PULSE_COUNT}; i++) {
                if(abs(uPulses[i].x - vEdge) < 0.25) {
                  float d = (uPulses[i].y - vProgress) * uPulses[i].z;
                  signal += exp(-d * d * 1000.0) + step(0.0, d) * exp(-d * 13.0) * 0.65;
                }
              }
              vec3 color = mix(vec3(0.11, 0.52, 0.76), vec3(0.65, 0.88, 1.0), min(signal, 1.0));
              gl_FragColor = vec4(color, 0.105 + min(signal, 1.0) * 0.85);
            }
          `}
        />
      </lineSegments>
      <points geometry={graph.nodeGeometry}>
        <pointsMaterial map={texture} color="#7ddcff" size={0.037} transparent opacity={0.68} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {Array.from({ length: PULSE_COUNT }, (_, i) => (
        <group key={i}>
          <sprite ref={(el) => { heads.current[i] = el; }} scale={0.13}>
            <spriteMaterial map={texture} color={i % 3 === 0 ? "#c3b4ff" : "#c6f4ff"} transparent opacity={0.98} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <sprite ref={(el) => { flashes.current[i] = el; }} scale={0.1}>
            <spriteMaterial map={texture} color="#a29aff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}
    </group>
  );
}
