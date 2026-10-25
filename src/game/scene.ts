import * as THREE from "three";
import type { Graphics, CameraMode, Weather } from "@/game/types";
import type { MatchSim } from "@/game/engine";
import { HALF_X, HALF_Z } from "@/game/engine";

const SKIN = ["#f3d2b5", "#e0b088", "#c68642", "#8d5524", "#5c3310", "#3a2416"];
const HAIR = ["#1b1b1b", "#3a2918", "#6a3b22", "#e2cc84", "#8d8d8d", "#b4532a"];

function pitchTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 680;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 12; i++) {
    g.fillStyle = i % 2 === 0 ? "#1e7a3a" : "#176833";
    g.fillRect((i * c.width) / 12, 0, c.width / 12 + 1, c.height);
  }
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 4;
  g.strokeRect(28, 28, c.width - 56, c.height - 56);
  g.beginPath();
  g.moveTo(c.width / 2, 28);
  g.lineTo(c.width / 2, c.height - 28);
  g.stroke();
  g.beginPath();
  g.arc(c.width / 2, c.height / 2, 78, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.beginPath();
  g.arc(c.width / 2, c.height / 2, 5, 0, Math.PI * 2);
  g.fill();
  const box = (x: number, dir: number) => {
    g.strokeRect(x, c.height / 2 - 150, 130 * dir, 300);
    g.strokeRect(x, c.height / 2 - 70, 52 * dir, 140);
  };
  box(28, 1);
  box(c.width - 28, -1);
  g.fillRect(28 + 92, c.height / 2 - 3, 6, 6);
  g.fillRect(c.width - 28 - 98, c.height / 2 - 3, 6, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function numberTexture(n: number, color: string) {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 128, 128);
  g.fillStyle = color;
  g.font = "700 72px Oswald, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 64, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function hex(s: string) {
  return new THREE.Color(s);
}

export type View = {
  sync: (sim: MatchSim, camera: CameraMode) => void;
  resize: () => void;
  destroy: () => void;
};

export function createView(canvas: HTMLCanvasElement, sim: MatchSim, graphics: Graphics, weather: Weather): View {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: graphics !== "low", alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(weather === "day" ? 0x8ebbe0 : weather === "overcast" ? 0x6d7684 : 0x07101c, 1);
  const dprCap = graphics === "low" ? 1 : graphics === "medium" ? 1.25 : 1.6;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  if (graphics === "high") {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(weather === "day" ? 0x9ec4e4 : weather === "rain" ? 0x1a2433 : 0x07101c, 40, weather === "overcast" ? 90 : 130);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 260);
  const camPos = new THREE.Vector3(0, 16, 22);
  const look = new THREE.Vector3();
  const want = new THREE.Vector3();
  const aimV = new THREE.Vector3();

  const hemi = new THREE.HemisphereLight(weather === "day" ? 0xd7ecff : 0x89a4c7, 0x1a3a22, weather === "day" ? 1.15 : 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4d8, weather === "day" ? 1.35 : 0.85);
  sun.position.set(-30, 48, 18);
  if (graphics === "high") {
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 140;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
  }
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(96, 40), new THREE.MeshLambertMaterial({ color: 0x101610 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const pitch = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_X * 2, HALF_Z * 2),
    new THREE.MeshLambertMaterial({ map: pitchTexture() }),
  );
  pitch.rotation.x = -Math.PI / 2;
  pitch.receiveShadow = true;
  scene.add(pitch);

  const boardMat = new THREE.MeshLambertMaterial({ color: 0xd6ff3f });
  for (const side of [-1, 1]) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(HALF_X * 2 + 4, 0.7, 0.3), boardMat);
    board.position.set(0, 0.4, side * (HALF_Z + 1.4));
    scene.add(board);
  }

  const standMat = new THREE.MeshLambertMaterial({ color: weather === "day" ? 0x2a3344 : 0x161d2b });
  const standGeo = new THREE.BoxGeometry(HALF_X * 2 + 18, 7, 8);
  for (const z of [-1, 1]) {
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(0, 3.2, z * (HALF_Z + 10));
    scene.add(stand);
  }
  const endGeo = new THREE.BoxGeometry(8, 6, HALF_Z * 2 + 8);
  for (const x of [-1, 1]) {
    const stand = new THREE.Mesh(endGeo, standMat);
    stand.position.set(x * (HALF_X + 10), 2.8, 0);
    scene.add(stand);
  }

  const crowdN = graphics === "low" ? 0 : graphics === "medium" ? 280 : 640;
  let crowd: THREE.InstancedMesh | null = null;
  if (crowdN) {
    const geo = new THREE.BoxGeometry(0.32, 0.48, 0.32);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    crowd = new THREE.InstancedMesh(geo, mat, crowdN);
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < crowdN; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const along = (i / crowdN) * 2 - 1;
      dummy.position.set(along * (HALF_X + 4), 2.2 + (i % 5) * 0.55, side * (HALF_Z + 7.2 + (i % 3) * 0.45));
      dummy.updateMatrix();
      crowd.setMatrixAt(i, dummy.matrix);
      col.setHSL((i % 17) / 17, 0.45, 0.45);
      crowd.setColorAt(i, col);
    }
    scene.add(crowd);
  }

  const postMat = new THREE.MeshLambertMaterial({ color: 0xf4f7fb });
  function addGoal(x: number) {
    const g = new THREE.Group();
    const dir = x > 0 ? 1 : -1;
    const postH = 2.44;
    const halfW = 3.66;
    const mk = (w: number, h: number, d: number, px: number, py: number, pz: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), postMat);
      m.position.set(px, py, pz);
      g.add(m);
    };
    mk(0.12, postH, 0.12, 0, postH / 2, -halfW);
    mk(0.12, postH, 0.12, 0, postH / 2, halfW);
    mk(0.12, 0.12, halfW * 2, 0, postH, 0);
    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(halfW * 2, postH),
      new THREE.MeshBasicMaterial({ color: 0xdde6f2, transparent: true, opacity: 0.18, side: THREE.DoubleSide }),
    );
    net.position.set(dir * 1.4, postH / 2, 0);
    net.rotation.y = Math.PI / 2;
    g.add(net);
    g.position.set(x, 0, 0);
    scene.add(g);
  }
  addGoal(-HALF_X);
  addGoal(HALF_X);

  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff1c2 });
  for (const x of [-36, 36]) {
    for (const z of [-28, 28]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 16, 6), new THREE.MeshLambertMaterial({ color: 0x222833 }));
      pole.position.set(x, 8, z);
      scene.add(pole);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.6), lampMat);
      lamp.position.set(x, 16, z);
      scene.add(lamp);
    }
  }

  const torsoGeo = new THREE.BoxGeometry(0.48, 0.58, 0.26);
  const headGeo = new THREE.SphereGeometry(0.15, 10, 8);
  const limbGeo = new THREE.BoxGeometry(0.13, 0.5, 0.14);
  const armGeo = new THREE.BoxGeometry(0.1, 0.42, 0.11);
  const hairGeo = new THREE.SphereGeometry(0.16, 8, 6);
  const bootGeo = new THREE.BoxGeometry(0.14, 0.08, 0.2);

  type Puppet = {
    group: THREE.Group;
    legL: THREE.Object3D;
    legR: THREE.Object3D;
    armL: THREE.Object3D;
    armR: THREE.Object3D;
    id: string;
    num: THREE.Mesh;
  };
  const puppets: Puppet[] = [];
  const shirtMats = [0, 1].map((team) => new THREE.MeshLambertMaterial({ color: hex(team === 0 ? sim.cfg.home.kit[0] : sim.cfg.away.kit[0]) }));
  const shortMats = [0, 1].map((team) => new THREE.MeshLambertMaterial({ color: hex(team === 0 ? sim.cfg.home.kit[1] : sim.cfg.away.kit[1]) }));
  const gkMats = [0, 1].map((team) => {
    const base = hex(team === 0 ? sim.cfg.home.kit[0] : sim.cfg.away.kit[0]);
    const lum = 0.3 * base.r + 0.6 * base.g + 0.1 * base.b;
    return new THREE.MeshLambertMaterial({ color: lum > 0.6 ? 0x0e6b3a : 0xff7a1a });
  });
  const skinMats = SKIN.map((c) => new THREE.MeshLambertMaterial({ color: c }));
  const hairMats = HAIR.map((c) => new THREE.MeshLambertMaterial({ color: c }));

  function makePuppet(team: 0 | 1, gk: boolean, num: number, skin: number, hair: number, style: number): Puppet {
    const group = new THREE.Group();
    const shirt = gk ? gkMats[team]! : shirtMats[team]!;
    const torso = new THREE.Mesh(torsoGeo, shirt);
    torso.position.y = 1.12;
    torso.castShadow = graphics === "high";
    group.add(torso);
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.24), shortMats[team]!);
    shorts.position.y = 0.78;
    group.add(shorts);
    const pivotL = new THREE.Group();
    const pivotR = new THREE.Group();
    pivotL.position.set(-0.12, 0.74, 0);
    pivotR.position.set(0.12, 0.74, 0);
    const legL = new THREE.Mesh(limbGeo, skinMats[skin % skinMats.length]!);
    const legR = new THREE.Mesh(limbGeo, skinMats[skin % skinMats.length]!);
    legL.position.y = -0.26;
    legR.position.y = -0.26;
    pivotL.add(legL);
    pivotR.add(legR);
    group.add(pivotL, pivotR);
    const armL = new THREE.Mesh(armGeo, shirt);
    const armR = new THREE.Mesh(armGeo, shirt);
    armL.position.set(-0.32, 1.18, 0);
    armR.position.set(0.32, 1.18, 0);
    group.add(armL, armR);
    const head = new THREE.Mesh(headGeo, skinMats[skin % skinMats.length]!);
    head.position.y = 1.58;
    group.add(head);
    if (style > 0) {
      const hairM = new THREE.Mesh(hairGeo, hairMats[hair % hairMats.length]!);
      hairM.position.y = 1.68;
      hairM.scale.set(style === 3 ? 1.05 : 0.95, style === 2 ? 0.7 : style === 3 ? 1.15 : 0.55, 0.95);
      group.add(hairM);
    }
    const bootL = new THREE.Mesh(bootGeo, new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    const bootR = new THREE.Mesh(bootGeo, new THREE.MeshLambertMaterial({ color: 0x222 }));
    bootL.position.set(-0.12, 0.06, 0.04);
    bootR.position.set(0.12, 0.06, 0.04);
    group.add(bootL, bootR);
    const numMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.34),
      new THREE.MeshBasicMaterial({ map: numberTexture(num, "#f7f7f2"), transparent: true, depthWrite: false }),
    );
    numMesh.position.set(0, 1.16, -0.14);
    numMesh.rotation.y = Math.PI;
    group.add(numMesh);
    scene.add(group);
    return { group, legL: pivotL, legR: pivotR, armL, armR, id: "", num: numMesh };
  }

  const initial = sim.renderPlayers();
  initial.forEach((p) => {
    puppets.push(makePuppet(p.team, p.gk, p.num, p.skin, p.hair, p.hairStyle));
  });

  // Shared leg geometry was translated twice if both use same after translate once — legR shares geometry. OK one translate.

  const ballCanvas = document.createElement("canvas");
  ballCanvas.width = 128;
  ballCanvas.height = 64;
  const bg = ballCanvas.getContext("2d")!;
  bg.fillStyle = "#f4f4f4";
  bg.fillRect(0, 0, 128, 64);
  bg.fillStyle = "#1b1b1b";
  for (let i = 0; i < 6; i++) {
    bg.beginPath();
    bg.arc(16 + (i % 3) * 40, i < 3 ? 18 : 44, 8, 0, Math.PI * 2);
    bg.fill();
  }
  const ballTex = new THREE.CanvasTexture(ballCanvas);
  ballTex.colorSpace = THREE.SRGBColorSpace;
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 12),
    new THREE.MeshLambertMaterial({ map: ballTex }),
  );
  ball.castShadow = graphics === "high";
  scene.add(ball);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  scene.add(shadow);

  const aim = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.5, 18),
    new THREE.MeshBasicMaterial({ color: 0xd6ff3f, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
  );
  aim.rotation.x = -Math.PI / 2;
  aim.position.y = 0.05;
  aim.visible = false;
  scene.add(aim);

  const ref = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 3, 6), new THREE.MeshLambertMaterial({ color: 0x111111 }));
  ref.position.y = 0.7;
  scene.add(ref);

  let rain: THREE.Points | null = null;
  if (weather === "rain" && graphics !== "low") {
    const n = 400;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 90;
      arr[i * 3 + 1] = Math.random() * 24;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    rain = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(arr, 3)), new THREE.PointsMaterial({ color: 0xcfe4ff, size: 0.08, transparent: true, opacity: 0.55 }));
    scene.add(rain);
  }

  let t = 0;
  const clock = new THREE.Timer();
  clock.connect(document);

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  resize();

  function sync(live: MatchSim, mode: CameraMode) {
    clock.update();
    const dt = Math.min(0.05, clock.getDelta());
    t += dt;
    const players = live.renderPlayers();
    const atk = live.attack[live.cfg.userTeam] ?? 1;
    players.forEach((p, i) => {
      const pup = puppets[i];
      if (!pup) return;
      if (pup.id !== p.id) {
        pup.id = p.id;
        const mat = pup.num.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.map = numberTexture(p.num, "#f7f7f2");
        mat.needsUpdate = true;
        const s = p.height / 182;
        pup.group.scale.set(p.bulk, s, p.bulk);
      }
      pup.group.visible = !p.sent;
      pup.group.position.set(p.x, 0, p.z);
      pup.group.rotation.y = p.yaw + Math.PI;
      pup.group.rotation.z = p.dive > 0 ? p.diveDir * 0.9 * Math.min(1, p.dive * 2) : 0;
      pup.group.rotation.x = p.down > 0 ? 0.6 : 0;
      const run = Math.min(1, p.speed / 6);
      const phase = t * (8 + p.speed);
      const swing = Math.sin(phase) * 0.7 * run;
      pup.legL.rotation.x = p.kick > 0 ? -1.1 : swing;
      pup.legR.rotation.x = p.kick > 0 ? 0.4 : -swing;
      pup.armL.rotation.x = -swing * 0.6;
      pup.armR.rotation.x = swing * 0.6;
    });
    ball.position.set(live.ball.x, live.ball.y, live.ball.z);
    ball.rotation.x += live.ball.vz * dt * 0.4;
    ball.rotation.z += live.ball.vx * dt * 0.4;
    shadow.position.set(live.ball.x, 0.03, live.ball.z);
    shadow.scale.setScalar(1 + live.ball.y * 0.35);
    (shadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.08, 0.4 - live.ball.y * 0.05);
    if (live.aim && live.phase === "play") {
      aim.visible = true;
      aim.position.set(live.aim.x, 0.06, live.aim.z);
    } else aim.visible = false;

    ref.position.x += ((live.ball.x + atk * -6) - ref.position.x) * 0.04;
    ref.position.z += (live.ball.z * 0.3 - ref.position.z) * 0.04;

    const dist = mode === "tele" ? 15 : mode === "wide" ? 32 : mode === "tactical" ? 10 : 22;
    const height = mode === "tele" ? 8.5 : mode === "wide" ? 20 : mode === "tactical" ? 52 : 13;
    const focusX = live.phase === "replay" ? live.ball.x : live.ball.x * 0.82 + (players[live.controlled]?.x ?? live.ball.x) * 0.18;
    const focusZ = live.ball.z * 0.75;
    want.set(focusX - atk * dist, height, focusZ + (mode === "tactical" ? 0.2 : 0));
    look.set(focusX + atk * 4, mode === "tactical" ? 0 : 0.4, focusZ);
    if (live.shake > 0) {
      want.x += Math.sin(t * 40) * live.shake * 0.4;
      want.y += Math.cos(t * 35) * live.shake * 0.2;
    }
    const k = 1 - Math.exp(-4.5 * Math.max(dt, 0.016));
    camPos.lerp(want, k);
    camera.position.copy(camPos);
    camera.lookAt(look);
    if (rain) {
      rain.position.y = -((t * 14) % 12);
      rain.position.x = focusX;
      rain.position.z = focusZ;
    }
    aimV.copy(look);
    renderer.render(scene, camera);
  }

  function destroy() {
    clock.dispose();
    renderer.dispose();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) {
        const map = (mat as THREE.MeshBasicMaterial).map;
        map?.dispose();
        mat.dispose();
      }
    });
  }

  return { sync, resize, destroy };
}
