import { useEffect, useRef, useState } from "react";
import { createMixer, type Mixer } from "@/game/audio";
import { emptyInput, MatchSim, type Input, type MatchConfig, type Snap } from "@/game/engine";
import type { View } from "@/game/scene";
import type { CameraMode, Settings } from "@/game/types";

type Props = {
  config: MatchConfig;
  settings: Settings;
  mixer: Mixer;
  onExit: (result: ReturnType<MatchSim["result"]> | null) => void;
};

export function MatchView({ config, settings, mixer, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<MatchSim | null>(null);
  const [snap, setSnap] = useState<Snap | null>(null);
  const [paused, setPaused] = useState(false);
  const [camera, setCamera] = useState<CameraMode>(settings.camera);
  const [subOut, setSubOut] = useState<number | null>(null);
  const [error, setError] = useState("");
  const pausedRef = useRef(false);
  const camRef = useRef(camera);
  const joy = useRef({ x: 0, y: 0, sprint: false, shoot: false });
  const edges = useRef({ pass: false, through: false, cross: false, tackle: false, slide: false, skill: false, press: false, gk: false, switch: false, shootUp: false });

  useEffect(() => {
    pausedRef.current = paused;
    simRef.current && (simRef.current.subWindow = paused);
  }, [paused]);
  useEffect(() => {
    camRef.current = camera;
  }, [camera]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sim = new MatchSim(config);
    simRef.current = sim;
    setSnap(sim.snap());
    const keys = new Set<string>();
    const forced = new Set<string>();
    const prevKeys = new Set<string>();
    let view: View | null = null;
    let raf = 0;
    let dead = false;
    let acc = 0;
    let last = performance.now();
    let hudAt = 0;
    let shootWas = false;
    const portrait = window.innerHeight > window.innerWidth;
    if (portrait) setCamera("wide");

    window.__controlsTest = {
      getYaw: () => sim.controlledYaw(),
      getSpeed: () => sim.controlledSpeed(),
      setKeys: (codes) => {
        forced.clear();
        for (const code of codes) forced.add(code);
      },
    };

    const down = (e: KeyboardEvent) => {
      keys.add(e.code);
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keys.delete(e.code);
    const blur = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);

    const held = (code: string) => keys.has(code) || forced.has(code);
    const edgeKey = (code: string) => held(code) && !prevKeys.has(code);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const input: Input = emptyInput();
      let ax = joy.current.x;
      let ay = joy.current.y;
      if (held("KeyA") || held("ArrowLeft")) ax -= 1;
      if (held("KeyD") || held("ArrowRight")) ax += 1;
      if (held("KeyW") || held("ArrowUp")) ay += 1;
      if (held("KeyS") || held("ArrowDown")) ay -= 1;
      input.ax = Math.max(-1, Math.min(1, ax));
      input.ay = Math.max(-1, Math.min(1, ay));
      input.sprint = joy.current.sprint || held("ShiftLeft") || held("ShiftRight");
      input.shootHeld = joy.current.shoot || held("KeyL");
      input.shootRelease = edges.current.shootUp || (shootWas && !input.shootHeld);
      input.pass = edges.current.pass || edgeKey("KeyJ");
      input.through = edges.current.through || edgeKey("KeyK");
      input.cross = edges.current.cross || edgeKey("KeyC");
      input.tackle = edges.current.tackle || edgeKey("Space");
      input.slide = edges.current.slide || edgeKey("KeyX");
      input.skill = edges.current.skill || edgeKey("KeyE");
      input.press = edges.current.press || edgeKey("KeyF");
      input.gkRush = edges.current.gk || edgeKey("KeyR");
      input.switchPlayer = edges.current.switch || edgeKey("KeyQ");
      edges.current = { pass: false, through: false, cross: false, tackle: false, slide: false, skill: false, press: false, gk: false, switch: false, shootUp: false };
      shootWas = input.shootHeld;
      for (const code of ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "KeyJ", "KeyK", "KeyL", "KeyC", "Space", "KeyX", "KeyE", "KeyF", "KeyR", "KeyQ", "ShiftLeft", "ShiftRight"]) {
        if (held(code)) prevKeys.add(code);
        else prevKeys.delete(code);
      }
      if (!pausedRef.current) {
        acc += dt;
        let n = 0;
        while (acc >= 1 / 60 && n < 4) {
          sim.step(input, 1 / 60);
          input.pass = false;
          input.through = false;
          input.cross = false;
          input.tackle = false;
          input.slide = false;
          input.skill = false;
          input.press = false;
          input.gkRush = false;
          input.switchPlayer = false;
          input.shootRelease = false;
          acc -= 1 / 60;
          n++;
        }
      }
      view?.sync(sim, camRef.current);
      if (sim.fx.length) {
        for (const fx of sim.fx) {
          mixer.play(fx);
          if (settings.vibration && fx === "goal" && navigator.vibrate) navigator.vibrate(40);
        }
        sim.fx.length = 0;
      }
      hudAt += dt;
      const phase = sim.phase;
      if (hudAt > 0.12 || phase === "halftime" || phase === "fulltime" || phase === "extrabreak" || phase === "goal") {
        hudAt = 0;
        setSnap(sim.snap());
      }
    };

    void import("@/game/scene")
      .then((mod) => {
        if (dead) return;
        view = mod.createView(canvas, sim, settings.graphics, config.weather);
        raf = requestAnimationFrame(frame);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "The pitch could not start.");
      });

    const onResize = () => view?.resize();
    window.addEventListener("resize", onResize);
    const vis = () => {
      if (document.visibilityState === "visible") mixer.resume();
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", vis);
      view?.destroy();
      delete window.__controlsTest;
    };
  }, [config, mixer, settings.graphics, settings.vibration]);

  const tap = (key: keyof typeof edges.current) => {
    edges.current[key] = true;
  };

  const overlay = snap && (paused || snap.phase === "halftime" || snap.phase === "fulltime" || snap.phase === "extrabreak");

  return (
    <div className={`relative h-dvh w-full overflow-hidden bg-bg ${settings.leftHanded ? "ninety-left" : ""}`}>
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-bg p-6 text-center">
          <p>{error}</p>
        </div>
      ) : null}
      {snap ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-bg/80 px-3 py-1.5 backdrop-blur-sm">
              <span className="font-display text-sm tracking-wide">{snap.shorts[0]}</span>
              <span className="font-display text-2xl leading-none text-accent">
                {snap.score[0]}–{snap.score[1]}
              </span>
              <span className="font-display text-sm tracking-wide">{snap.shorts[1]}</span>
              <span className="text-sm text-muted">{snap.minute}</span>
            </div>
            {snap.event ? <p className="max-w-md truncate text-center text-sm text-fg/90">{snap.event}</p> : null}
            {snap.shootout ? <p className="text-center text-sm text-accent">{snap.shootout.hint}</p> : null}
          </div>
          <button
            type="button"
            className="absolute right-3 top-[max(0.6rem,env(safe-area-inset-top))] rounded-full border border-line bg-bg/80 px-3 py-2 text-sm"
            onClick={() => setPaused(true)}
          >
            Pause
          </button>
          <div className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 flex items-end justify-between gap-3">
            <Stick
              className={settings.leftHanded ? "order-2" : "order-1"}
              scale={settings.buttonScale}
              onChange={(x, y) => {
                joy.current.x = x;
                joy.current.y = y;
              }}
            />
            <div className={`pointer-events-auto grid grid-cols-3 gap-2 ${settings.leftHanded ? "order-1" : "order-2"}`} style={{ scale: String(settings.buttonScale) }}>
              <Tap label="Thru" onPress={() => tap("through")} />
              <Hold label="Shoot" onHold={(v) => (joy.current.shoot = v)} onRelease={() => (edges.current.shootUp = true)} hot />
              <Tap label="Cross" onPress={() => tap("cross")} />
              <Tap label="Pass" onPress={() => tap("pass")} />
              <Hold label="Sprint" onHold={(v) => (joy.current.sprint = v)} />
              <Tap label="Tackle" onPress={() => tap("tackle")} />
              <Tap label="Skill" onPress={() => tap("skill")} />
              <Tap label="Switch" onPress={() => tap("switch")} />
              <Tap label="Press" onPress={() => tap("press")} />
            </div>
          </div>
          {snap.power > 0 ? (
            <div className="absolute bottom-36 left-1/2 h-2 w-28 -translate-x-1/2 overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-accent" style={{ width: `${Math.round(snap.power * 100)}%` }} />
            </div>
          ) : null}
          <div className="absolute bottom-[max(0.8rem,env(safe-area-inset-bottom))] left-1/2 hidden -translate-x-1/2 text-center text-xs text-muted md:block">
            {snap.controlled} · {snap.controlledPos}
            <div className="mx-auto mt-1 h-1 w-24 overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-accent" style={{ width: `${Math.round(snap.stamina * 100)}%` }} />
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-display text-2xl tracking-widest">MATCHDAY</p>
        </div>
      )}
      {overlay && snap ? (
        <div className="absolute inset-0 overflow-y-auto bg-bg/88 p-4 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6">
            <h2 className="font-display text-4xl tracking-wide">
              {snap.phase === "fulltime" ? "Full time" : snap.phase === "halftime" ? "Half time" : snap.phase === "extrabreak" ? "Extra time" : "Paused"}
            </h2>
            <p className="font-display text-5xl text-accent">
              {snap.shorts[0]} {snap.score[0]}–{snap.score[1]} {snap.shorts[1]}
            </p>
            {snap.pens ? <p className="text-muted">Penalties {snap.pens[0]}–{snap.pens[1]}</p> : null}
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Stat label="Shots" a={snap.shots[0]} b={snap.shots[1]} />
              <Stat label="On target" a={snap.sot[0]} b={snap.sot[1]} />
              <Stat label="Possession" a={`${Math.round(snap.poss * 100)}%`} b={`${100 - Math.round(snap.poss * 100)}%`} />
              <Stat label="Pass acc." a={`${snap.passAcc[0]}%`} b={`${snap.passAcc[1]}%`} />
              <Stat label="Fouls" a={snap.fouls[0]} b={snap.fouls[1]} />
              <Stat label="Corners" a={snap.corners[0]} b={snap.corners[1]} />
              <Stat label="Cards" a={snap.yellow[0]} b={snap.yellow[1]} />
            </div>
            {snap.scorers.length ? (
              <ul className="text-sm text-muted">
                {snap.scorers.map((s, i) => (
                  <li key={`${s.name}-${i}`}>
                    {s.minute}' {s.name}
                    {s.og ? " (OG)" : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            {snap.phase !== "fulltime" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm text-muted">On the pitch · {snap.subsLeft[snap.userTeam]} subs left</p>
                  <ul className="flex flex-col gap-1">
                    {snap.xi.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${subOut === p.slot ? "border-accent bg-surface" : "border-line bg-surface"}`}
                          onClick={() => setSubOut(p.slot)}
                        >
                          <span>
                            {p.pos} {p.name}
                          </span>
                          <span className="text-muted">{p.ovr}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-sm text-muted">Bench — tap a starter, then a sub</p>
                  <ul className="flex flex-col gap-1">
                    {snap.bench.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2 text-left"
                          onClick={() => {
                            if (subOut == null) return;
                            const ok = simRef.current?.substitute(snap.userTeam, subOut, p.id);
                            if (ok) {
                              setSubOut(null);
                              setSnap(simRef.current!.snap());
                            }
                          }}
                        >
                          <span>
                            {p.pos} {p.name}
                          </span>
                          <span className="text-muted">{p.ovr}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2">
                {snap.ratings
                  .slice()
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 8)
                  .map((p) => (
                    <li key={p.id} className="flex justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                      <span>
                        {p.name} <span className="text-muted">{p.pos}</span>
                      </span>
                      <span className="text-accent">{p.rating.toFixed(1)}</span>
                    </li>
                  ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              {(["broadcast", "tele", "wide", "tactical"] as CameraMode[]).map((c) => (
                <button key={c} type="button" className={`rounded-full border px-3 py-2 text-sm capitalize ${camera === c ? "border-accent text-accent" : "border-line"}`} onClick={() => setCamera(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {snap.phase === "fulltime" ? (
                <button type="button" className="rounded-full bg-accent px-5 py-3 font-semibold text-ink" onClick={() => onExit(simRef.current?.result() ?? null)}>
                  Continue
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="rounded-full bg-accent px-5 py-3 font-semibold text-ink"
                    onClick={() => {
                      if (snap.phase === "halftime" || snap.phase === "extrabreak") simRef.current?.continueBreak();
                      setPaused(false);
                      setSnap(simRef.current?.snap() ?? null);
                    }}
                  >
                    {snap.phase === "halftime" || snap.phase === "extrabreak" ? "Continue" : "Resume"}
                  </button>
                  {config.mode === "practice" ? (
                    <button
                      type="button"
                      className="rounded-full border border-line px-5 py-3"
                      onClick={() => {
                        simRef.current?.practiceReset();
                        setPaused(false);
                      }}
                    >
                      Reset ball
                    </button>
                  ) : null}
                  <button type="button" className="rounded-full border border-danger px-5 py-3 text-danger" onClick={() => onExit(snap.phase === "fulltime" ? simRef.current?.result() ?? null : null)}>
                    Quit
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-muted">Keys: WASD move, J pass, K through, L shoot, C cross, Space tackle, E skill, Q switch, Shift sprint.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, a, b }: { label: string; a: string | number; b: string | number }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-lg">
        {a} <span className="text-muted">–</span> {b}
      </p>
    </div>
  );
}

function Tap({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      type="button"
      className="h-12 min-w-12 rounded-full border border-line bg-bg/75 px-2 text-xs font-semibold tracking-wide"
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
    >
      {label}
    </button>
  );
}

function Hold({ label, onHold, onRelease, hot }: { label: string; onHold: (v: boolean) => void; onRelease?: () => void; hot?: boolean }) {
  return (
    <button
      type="button"
      className={`h-12 min-w-12 rounded-full px-2 text-xs font-semibold tracking-wide ${hot ? "bg-accent text-ink" : "border border-line bg-bg/75"}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onHold(true);
      }}
      onPointerUp={() => {
        onHold(false);
        onRelease?.();
      }}
      onPointerLeave={() => onHold(false)}
    >
      {label}
    </button>
  );
}

function Stick({ onChange, scale, className }: { onChange: (x: number, y: number) => void; scale: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);

  const setFrom = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height / 2);
    const max = r.width * 0.36;
    const m = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, m / max);
    const x = (dx / m) * k;
    const y = (-dy / m) * k;
    setKnob({ x: (dx / m) * Math.min(max, m), y: (dy / m) * Math.min(max, m) });
    onChange(x, y);
  };

  return (
    <div
      ref={ref}
      className={`pointer-events-auto relative h-32 w-32 rounded-full border border-line bg-bg/55 ${className ?? ""}`}
      style={{ scale: String(scale) }}
      onPointerDown={(e) => {
        id.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFrom(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (id.current !== e.pointerId) return;
        setFrom(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (id.current !== e.pointerId) return;
        id.current = null;
        setKnob({ x: 0, y: 0 });
        onChange(0, 0);
      }}
    >
      <span className="absolute top-1/2 left-1/2 h-12 w-12 rounded-full bg-accent" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
    </div>
  );
}
