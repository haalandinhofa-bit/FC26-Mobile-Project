import { FORMATIONS, fitScore } from "@/game/formations";
import type { Side } from "@/game/lineup";
import type { Assistance, Difficulty, Player, Pos, Weather } from "@/game/types";

export const HALF_X = 52.5;
export const HALF_Z = 34;
const G = 15.5;
const GOAL_W = 3.66;
const GOAL_H = 2.44;

export type Phase =
  | "kickoff"
  | "play"
  | "goal"
  | "replay"
  | "throw"
  | "goalkick"
  | "corner"
  | "freekick"
  | "penalty"
  | "halftime"
  | "extrabreak"
  | "fulltime"
  | "shootout";

export type Input = {
  ax: number;
  ay: number;
  sprint: boolean;
  pass: boolean;
  through: boolean;
  cross: boolean;
  shootHeld: boolean;
  shootRelease: boolean;
  tackle: boolean;
  slide: boolean;
  switchPlayer: boolean;
  skill: boolean;
  press: boolean;
  gkRush: boolean;
};

export const emptyInput = (): Input => ({
  ax: 0,
  ay: 0,
  sprint: false,
  pass: false,
  through: false,
  cross: false,
  shootHeld: false,
  shootRelease: false,
  tackle: false,
  slide: false,
  switchPlayer: false,
  skill: false,
  press: false,
  gkRush: false,
});

export type MatchConfig = {
  home: Side;
  away: Side;
  userTeam: 0 | 1;
  lengthSec: number;
  difficulty: Difficulty;
  weather: Weather;
  assistance: Assistance;
  mode: "match" | "practice" | "shootout";
  lockId?: string;
  knockout: boolean;
};

type SimP = {
  slot: number;
  team: 0 | 1;
  ref: Player;
  x: number;
  z: number;
  vx: number;
  vz: number;
  yaw: number;
  stamina: number;
  roleX: number;
  roleZ: number;
  role: Pos;
  chase: number;
  down: number;
  kick: number;
  dive: number;
  diveDir: number;
  yellow: number;
  sent: boolean;
  gkHold: number;
  skillCd: number;
  goals: number;
  assists: number;
  shots: number;
  passes: number;
  passesOk: number;
  tackles: number;
  fouls: number;
  saves: number;
};

type Ball = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  owner: number | null;
  intended: number | null;
  lastKicker: number | null;
  lastPasser: number | null;
  passT: number;
  shot: boolean;
  freeze: boolean;
  rolled: boolean;
};

type Piece = {
  kind: "kickoff" | "throw" | "goalkick" | "corner" | "freekick" | "penalty";
  team: 0 | 1;
  x: number;
  z: number;
  taker: number;
  timer: number;
};

type Sample = { bx: number; by: number; bz: number; px: Float32Array; pz: Float32Array };

export type Scorer = { name: string; team: 0 | 1; minute: string; og?: boolean };

export type RenderPlayer = {
  id: string;
  team: 0 | 1;
  x: number;
  z: number;
  yaw: number;
  speed: number;
  kick: number;
  down: number;
  dive: number;
  diveDir: number;
  sent: boolean;
  gk: boolean;
  num: number;
  height: number;
  skin: number;
  hair: number;
  hairStyle: number;
  bulk: number;
  name: string;
};

export type Snap = {
  phase: Phase;
  minute: string;
  score: [number, number];
  pens: [number, number] | null;
  names: [string, string];
  shorts: [string, string];
  kits: [[string, string, string], [string, string, string]];
  poss: number;
  shots: [number, number];
  sot: [number, number];
  fouls: [number, number];
  corners: [number, number];
  passAcc: [number, number];
  yellow: [number, number];
  red: [number, number];
  event: string;
  feed: string[];
  power: number;
  stamina: number;
  controlled: string;
  controlledPos: string;
  scorers: Scorer[];
  ratings: { id: string; name: string; team: 0 | 1; pos: Pos; rating: number; goals: number; assists: number }[];
  shootout: { team: 0 | 1; taken: { team: 0 | 1; scored: boolean }[]; userKick: boolean; hint: string } | null;
  subsLeft: [number, number];
  xi: { slot: number; id: string; name: string; pos: Pos; ovr: number; rating: number }[];
  bench: { id: string; name: string; pos: Pos; ovr: number }[];
  aim: { x: number; z: number } | null;
  stadium: string;
  userTeam: 0 | 1;
  lockId?: string;
};

const DIFF = {
  easy: { spd: 0.8, iq: 0.4, err: 1.45, user: 0.55 },
  normal: { spd: 0.95, iq: 0.68, err: 1, user: 0.82 },
  hard: { spd: 1.02, iq: 0.86, err: 0.78, user: 1 },
  world: { spd: 1.1, iq: 1, err: 0.6, user: 1.08 },
} as const;

const ASSIST = { low: 1, med: 0.62, high: 0.32 } as const;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function hypot(x: number, z: number) {
  return Math.hypot(x, z);
}
function lerpAng(a: number, b: number, t: number) {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * t;
}
function yawOf(vx: number, vz: number) {
  return Math.atan2(-vx, -vz);
}
function face(atk: number) {
  return atk > 0 ? -Math.PI / 2 : Math.PI / 2;
}

export function simScore(home: number, away: number, rand: () => number): [number, number] {
  const pois = (lambda: number) => {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= rand();
    } while (p > L && k < 9);
    return k - 1;
  };
  return [pois(1.28 * (home / Math.max(62, away))), pois(1.05 * (away / Math.max(62, home)))];
}

export class MatchSim {
  cfg: MatchConfig;
  ps: SimP[] = [];
  ball: Ball = {
    x: 0, y: 0.22, z: 0, vx: 0, vy: 0, vz: 0,
    owner: null, intended: null, lastKicker: null, lastPasser: null,
    passT: 0, shot: false, freeze: true, rolled: false,
  };
  phase: Phase = "kickoff";
  attack: [1, -1] as [number, number];
  period = 1;
  clock = 0;
  periodLen = 60;
  score: [number, number] = [0, 0];
  shots: [number, number] = [0, 0];
  sot: [number, number] = [0, 0];
  fouls: [number, number] = [0, 0];
  corners: [number, number] = [0, 0];
  passAtt: [number, number] = [0, 0];
  passOk: [number, number] = [0, 0];
  possT: [number, number] = [0, 0];
  yellows: [number, number] = [0, 0];
  reds: [number, number] = [0, 0];
  scorers: Scorer[] = [];
  feed: string[] = [];
  fx: string[] = [];
  piece: Piece | null = null;
  controlled = 7;
  power = 0;
  powerOn = false;
  aim: { x: number; z: number } | null = null;
  shake = 0;
  aiT = 0;
  offside = new Set<number>();
  pressT = 0;
  gkRushT = 0;
  trail: Sample[] = [];
  trailAcc = 0;
  replay = 0;
  replayLen = 2.2;
  celT = 0;
  goalSide: 0 | 1 = 0;
  subs: [number, number] = [0, 0];
  subWindow = false;
  pens: { team: 0 | 1; scored: boolean }[] = [];
  penTeam: 0 | 1 = 0;
  penWait = 0;
  penResolved = true;
  userKick = false;
  sides: [Side, Side];
  firstKick: 0 | 1 = 0;
  ended = false;

  constructor(cfg: MatchConfig) {
    this.cfg = cfg;
    this.sides = [cfg.home, cfg.away];
    this.periodLen = cfg.mode === "practice" ? 99999 : Math.max(30, cfg.lengthSec / 2);
    this.attack = [1, -1];
    for (let team = 0; team < 2; team++) {
      const side = team === 0 ? cfg.home : cfg.away;
      const form = FORMATIONS[side.tactics.formation];
      side.xi.forEach((ref, slot) => {
        const sl = form[slot] ?? form[0]!;
        this.ps.push({
          slot,
          team: team as 0 | 1,
          ref,
          x: 0,
          z: 0,
          vx: 0,
          vz: 0,
          yaw: 0,
          stamina: 1,
          roleX: sl.x,
          roleZ: sl.z,
          role: sl.pos,
          chase: 0,
          down: 0,
          kick: 0,
          dive: 0,
          diveDir: 0,
          yellow: 0,
          sent: false,
          gkHold: 0,
          skillCd: 0,
          goals: 0,
          assists: 0,
          shots: 0,
          passes: 0,
          passesOk: 0,
          tackles: 0,
          fouls: 0,
          saves: 0,
        });
      });
    }
    const ut = cfg.userTeam;
    if (cfg.lockId) {
      const i = this.ps.findIndex((p) => p.ref.id === cfg.lockId && p.team === ut);
      this.controlled = i >= 0 ? i : this.defaultControl(ut);
    } else {
      this.controlled = this.defaultControl(ut);
    }
    if (cfg.mode === "shootout") {
      this.phase = "shootout";
      this.placeAll();
      this.beginShootout();
    } else {
      this.beginKickoff(0);
    }
  }

  private defaultControl(team: 0 | 1) {
    const list = this.ps.filter((p) => p.team === team && p.role !== "GK");
    list.sort((a, b) => Math.abs(a.roleX - 0.5) - Math.abs(b.roleX - 0.5));
    return list[0] ? this.idx(list[0]) : team * 11 + 7;
  }

  private idx(p: SimP) {
    return p.team * 11 + p.slot;
  }

  private at(i: number) {
    return this.ps[i]!;
  }

  private log(s: string) {
    this.feed.unshift(s);
    if (this.feed.length > 8) this.feed.pop();
  }

  private ownX(team: 0 | 1) {
    return this.attack[team]! > 0 ? -HALF_X : HALF_X;
  }

  private mapX(team: 0 | 1, roleX: number) {
    const atk = this.attack[team]!;
    return this.ownX(team) + atk * (5 + roleX * 90);
  }

  private placeAll() {
    for (const p of this.ps) {
      p.x = this.mapX(p.team, p.roleX);
      p.z = p.roleZ * 30;
      p.vx = 0;
      p.vz = 0;
      p.yaw = face(this.attack[p.team]!);
      p.down = 0;
      if (p.sent) {
        p.x = 80;
        p.z = (p.team === 0 ? -8 : 8);
      }
    }
  }

  private pickTaker(team: 0 | 1, prefer: Pos) {
    const list = this.ps.filter((p) => p.team === team && !p.sent);
    const side = this.sides[team];
    if (prefer === "GK") return list.find((p) => p.role === "GK") ?? list[0]!;
    const pen = list.find((p) => p.ref.id === side.tactics.penalty);
    if (prefer === "ST" && pen) return pen;
    const ranked = [...list].sort((a, b) => fitScore(b.role, prefer) + b.ref.ovr - (fitScore(a.role, prefer) + a.ref.ovr));
    return ranked[0] ?? list[0]!;
  }

  private resetBall(x: number, y: number, z: number, freeze: boolean) {
    this.ball = {
      x, y, z, vx: 0, vy: 0, vz: 0,
      owner: null, intended: null, lastKicker: this.ball.lastKicker, lastPasser: null,
      passT: 0, shot: false, freeze, rolled: false,
    };
  }

  private beginKickoff(team: 0 | 1) {
    this.phase = "kickoff";
    this.placeAll();
    const taker = this.pickTaker(team, "CM");
    taker.x = this.attack[team]! > 0 ? -1.6 : 1.6;
    taker.z = 0;
    taker.yaw = face(this.attack[team]!);
    this.resetBall(0, 0.22, 0, true);
    this.piece = { kind: "kickoff", team, x: 0, z: 0, taker: this.idx(taker), timer: 0 };
    this.offside.clear();
    if (this.ps[this.controlled]?.team === team) this.controlled = this.idx(taker);
  }

  private setPiece(kind: Piece["kind"], team: 0 | 1, x: number, z: number) {
    const prefer: Pos = kind === "goalkick" || kind === "penalty" ? "GK" : kind === "corner" ? "RW" : kind === "throw" ? "LB" : "CAM";
    const taker = kind === "penalty" ? this.pickTaker(team, "ST") : kind === "goalkick" ? this.pickTaker(team, "GK") : this.pickTaker(team, prefer);
    if (kind === "penalty") {
      const goal = this.ownX((1 - team) as 0 | 1);
      x = goal + (goal > 0 ? -11 : 11);
      z = 0;
    }
    x = clamp(x, -HALF_X + 0.4, HALF_X - 0.4);
    z = clamp(z, -HALF_Z + 0.4, HALF_Z - 0.4);
    if (kind === "throw" || kind === "corner") {
      z = z >= 0 ? HALF_Z : -HALF_Z;
      if (kind === "corner") x = x >= 0 ? HALF_X : -HALF_X;
    }
    taker.x = x + (kind === "throw" ? 0 : this.attack[team]! > 0 ? -1.2 : 1.2);
    taker.z = z + (kind === "throw" ? (z > 0 ? 0.8 : -0.8) : 0);
    taker.down = 0;
    this.resetBall(x, kind === "throw" ? 1.4 : 0.22, z, true);
    this.phase = kind;
    this.piece = { kind, team, x, z, taker: this.idx(taker), timer: 0 };
    this.offside.clear();
    if (taker.team === this.cfg.userTeam && !taker.sent) this.controlled = this.idx(taker);
    if (kind === "corner") this.corners[team]++;
    this.fx.push("whistle");
  }

  private minuteLabel() {
    const base = this.period === 1 ? 0 : this.period === 2 ? 45 : this.period === 3 ? 90 : 105;
    const span = this.period < 3 ? 45 : 15;
    if (this.clock >= this.periodLen) return `${base + span}+`;
    return `${Math.max(base, Math.floor(base + (this.clock / this.periodLen) * span))}`;
  }

  private scoreGoal(attacking: 0 | 1, og: boolean) {
    this.score[attacking]++;
    const kicker = this.ball.lastKicker != null ? this.at(this.ball.lastKicker) : null;
    const name = og || !kicker || kicker.team !== attacking ? "Own goal" : kicker.ref.name;
    if (kicker && kicker.team === attacking && !og) {
      kicker.goals++;
      if (this.ball.lastPasser != null && this.ball.lastPasser !== this.ball.lastKicker) {
        const passer = this.at(this.ball.lastPasser);
        if (passer.team === attacking) passer.assists++;
      }
    }
    this.scorers.push({ name, team: attacking, minute: this.minuteLabel(), og: og || name === "Own goal" });
    this.log(`GOAL ${this.sides[attacking].short} — ${name}`);
    this.fx.push("goal");
    this.shake = 1;
    this.phase = "goal";
    this.celT = 1.35;
    this.goalSide = attacking;
    this.piece = null;
    this.ball.freeze = false;
    this.ball.owner = null;
    this.replay = 0;
  }

  private whistleOffside(p: SimP) {
    this.log(`Offside — ${p.ref.name}`);
    this.fx.push("whistle");
    const def = (1 - p.team) as 0 | 1;
    this.setPiece("freekick", def, p.x, p.z);
  }

  private secondLast(def: 0 | 1) {
    const own = this.ownX(def);
    const xs = this.ps.filter((p) => p.team === def && !p.sent).map((p) => p.x);
    xs.sort((a, b) => Math.abs(a - own) - Math.abs(b - own));
    return xs[1] ?? xs[0] ?? own;
  }

  private flagOffside(from: SimP) {
    this.offside.clear();
    const opp = (1 - from.team) as 0 | 1;
    const line = this.secondLast(opp);
    const atk = this.attack[from.team]!;
    for (const m of this.ps) {
      if (m.team !== from.team || m === from || m.sent || m.role === "GK") continue;
      const aheadBall = (m.x - this.ball.x) * atk > 0.6;
      const aheadLine = (m.x - line) * atk > 0.35;
      const half = m.x * atk > 1;
      if (aheadBall && aheadLine && half) this.offside.add(this.idx(m));
    }
  }

  private inOwnBox(team: 0 | 1, x: number, z: number) {
    const own = this.ownX(team);
    return Math.abs(z) < 20.1 && Math.abs(x - own) < 16.5;
  }

  private foul(by: SimP, x: number, z: number, slide: boolean) {
    by.fouls++;
    this.fouls[by.team]++;
    const att = (1 - by.team) as 0 | 1;
    this.fx.push("foul");
    const through = this.ps.some((p) => p.team === att && !p.sent && (p.x - by.x) * this.attack[att]! > 0 && p.role !== "GK");
    const last = !this.ps.some((p) => p.team === by.team && p !== by && !p.sent && p.role !== "GK" && Math.abs(p.x - this.ownX(by.team)) < Math.abs(by.x - this.ownX(by.team)) - 0.5);
    let card: "y" | "r" | null = null;
    if (slide && last && through && Math.random() < 0.55) card = "r";
    else if ((slide || Math.random() < 0.34) && Math.random() < 0.42) card = "y";
    if (card === "y") {
      by.yellow++;
      this.yellows[by.team]++;
      this.log(`Yellow — ${by.ref.name}`);
      if (by.yellow >= 2) card = "r";
    }
    if (card === "r") {
      by.sent = true;
      this.reds[by.team]++;
      by.x = 78;
      by.z = 10;
      by.vx = 0;
      by.vz = 0;
      this.log(`Red card — ${by.ref.name}`);
    }
    if (this.inOwnBox(by.team, x, z)) this.setPiece("penalty", att, x, z);
    else this.setPiece("freekick", att, x, z);
  }

  private launch(from: SimP, tx: number, tz: number, loft: boolean, speed: number, shot: boolean) {
    const dx = tx - this.ball.x;
    const dz = tz - this.ball.z;
    const dist = hypot(dx, dz) || 1;
    this.ball.owner = null;
    this.ball.freeze = false;
    this.ball.vx = (dx / dist) * speed;
    this.ball.vz = (dz / dist) * speed;
    this.ball.vy = loft ? Math.min(12, 3.4 + dist * 0.11) : shot ? 0.4 + speed * 0.04 : 0.55;
    this.ball.y = loft ? 0.35 : 0.26;
    this.ball.shot = shot;
    this.ball.rolled = false;
    this.ball.intended = null;
    this.ball.lastKicker = this.idx(from);
    if (!shot) {
      this.ball.lastPasser = this.idx(from);
      this.ball.passT = 0;
      from.passes++;
      this.passAtt[from.team]++;
      this.flagOffside(from);
    }
    from.kick = 0.26;
    this.fx.push(shot ? "shot" : "kick");
    this.piece = null;
    if (this.phase !== "play" && this.phase !== "goal" && this.phase !== "shootout") this.phase = "play";
  }

  private passTo(from: SimP, kind: "short" | "through" | "cross" | "long", ax: number, ay: number) {
    const atk = this.attack[from.team]!;
    const driving = hypot(ax, ay) > 0.2;
    const dirx = driving ? ay * atk : atk;
    const dirz = driving ? ax * atk : 0;
    const dl = hypot(dirx, dirz) || 1;
    const ux = dirx / dl;
    const uz = dirz / dl;
    let best: SimP | null = null;
    let bestS = -999;
    for (const m of this.ps) {
      if (m.team !== from.team || m === from || m.sent) continue;
      if (m.role === "GK" && kind !== "short") continue;
      let tx = m.x;
      let tz = m.z;
      if (kind === "through") {
        tx += atk * (8 + m.ref.pac / 18);
      }
      if (kind === "cross") {
        tx = this.ownX((1 - from.team) as 0 | 1) - atk * 8;
        tz = m.z * 0.3;
      }
      const dx = tx - from.x;
      const dz = tz - from.z;
      const dist = hypot(dx, dz);
      const maxD = kind === "short" ? 32 : 62;
      if (dist < 3.5 || dist > maxD) continue;
      const dot = (ux * dx + uz * dz) / dist;
      if (driving && dot < 0.05) continue;
      let score = dot * 3 - dist * 0.03 + m.roleX;
      if (this.offsideRisk(m, from)) score -= 2.4;
      if (score > bestS) {
        bestS = score;
        best = m;
      }
    }
    const d = DIFF[this.cfg.difficulty];
    const assist = from.team === this.cfg.userTeam ? ASSIST[this.cfg.assistance] * d.user : d.err;
    const err = (1 - from.ref.pas / 115) * assist * (this.cfg.weather === "rain" ? 1.15 : 1);
    if (!best) {
      const tx = from.x + ux * (kind === "short" ? 14 : 28);
      const tz = from.z + uz * (kind === "short" ? 14 : 22);
      this.launch(from, tx + (Math.random() - 0.5) * err * 6, tz + (Math.random() - 0.5) * err * 6, kind !== "short", kind === "short" ? 16 : 24, false);
      return;
    }
    let tx = best.x;
    let tz = best.z;
    if (kind === "through") tx += atk * (7 + best.ref.pac / 25);
    if (kind === "cross") {
      tx = this.ownX((1 - from.team) as 0 | 1) - atk * (6 + Math.random() * 4);
      tz = (Math.random() - 0.5) * 6;
    }
    tx += (Math.random() - 0.5) * err * (kind === "short" ? 3.2 : 6);
    tz += (Math.random() - 0.5) * err * (kind === "short" ? 3.2 : 6);
    const dist = hypot(tx - from.x, tz - from.z);
    const speed = clamp(dist * (kind === "short" ? 1.25 : 0.95) + 8, 12, 30) * (0.86 + from.ref.pas / 400);
    this.ball.intended = this.idx(best);
    this.launch(from, tx, tz, kind !== "short", speed, false);
  }

  private offsideRisk(m: SimP, from: SimP) {
    const atk = this.attack[from.team]!;
    const line = this.secondLast((1 - from.team) as 0 | 1);
    return (m.x - this.ball.x) * atk > 0.5 && (m.x - line) * atk > 0.3 && m.x * atk > 0;
  }

  private shoot(from: SimP, power: number, aimZ: number) {
    const opp = (1 - from.team) as 0 | 1;
    const goalX = this.ownX(opp);
    const dist = Math.abs(goalX - from.x);
    const d = DIFF[this.cfg.difficulty];
    const human = from.team === this.cfg.userTeam && this.idx(from) === this.controlled;
    const errK = human ? ASSIST[this.cfg.assistance] * d.user : d.err;
    const press = this.nearestOppDist(from);
    const weak = from.ref.foot === "L" ? 0.08 : 0;
    const tired = 1 - from.stamina;
    const err = (1 - from.ref.sho / 108) * (0.45 + dist / 38) * (press < 2.2 ? 1.35 : 0.85) * errK * (1 + tired * 0.45 + weak);
    let tz = clamp(aimZ + (Math.random() - 0.5) * err * 5.5, -5.2, 5.2);
    let ty = clamp(0.55 + power * 1.35 + (Math.random() - 0.4) * err * 1.3, 0.25, 3.1);
    const t = clamp(dist / (16 + power * 18), 0.32, 1.7);
    const sp = dist / t;
    this.ball.owner = null;
    this.ball.freeze = false;
    this.ball.vx = Math.sign(goalX - this.ball.x || from.x) * sp;
    this.ball.vz = (tz - this.ball.z) / t;
    this.ball.vy = (ty - this.ball.y + 0.5 * G * t * t) / t;
    this.ball.shot = true;
    this.ball.rolled = false;
    this.ball.intended = null;
    this.ball.lastKicker = this.idx(from);
    this.ball.y = Math.max(this.ball.y, 0.32);
    from.kick = 0.32;
    from.shots++;
    this.shots[from.team]++;
    const predZ = this.ball.z + this.ball.vz * t;
    const predY = ty;
    if (Math.abs(predZ) < GOAL_W && predY < GOAL_H && predY > 0) this.sot[from.team]++;
    this.fx.push("shot");
    this.piece = null;
    this.phase = "play";
    this.power = 0;
    this.powerOn = false;
  }

  private nearestOppDist(p: SimP) {
    let d = 99;
    for (const o of this.ps) {
      if (o.team === p.team || o.sent) continue;
      d = Math.min(d, hypot(o.x - p.x, o.z - p.z));
    }
    return d;
  }

  private decideCarrier(p: SimP) {
    if (p.gkHold > 0) return;
    const opp = (1 - p.team) as 0 | 1;
    const goalX = this.ownX(opp);
    const dist = Math.abs(goalX - p.x);
    const press = this.nearestOppDist(p);
    const d = DIFF[this.cfg.difficulty];
    const iq = p.team === this.cfg.userTeam ? 0.85 : d.iq;
    if (this.cfg.mode === "practice" && p.team !== this.cfg.userTeam) {
      if (Math.random() < 0.02) this.passTo(p, "short", 0, 1);
      return;
    }
    const style = this.sides[p.team].tactics.style;
    const shootBias = style === "possession" ? 0.7 : style === "counter" ? 1.15 : 1;
    const range = 14 + p.ref.sho / 12;
    if (dist < range && Math.abs(p.z) < 16 && press > 1.6 && Math.random() < (0.12 + p.ref.sho / 220) * iq * shootBias) {
      this.shoot(p, 0.55 + Math.random() * 0.4, p.z * 0.25 + (Math.random() - 0.5) * 1.4);
      return;
    }
    if (press < 4.2 || Math.random() < 0.55 * iq) {
      const kind = style === "counter" && Math.random() < 0.45 ? "through" : dist > 36 && Math.random() < 0.4 ? "long" : Math.abs(p.z) > 22 && dist < 30 ? "cross" : "short";
      this.passTo(p, kind === "long" ? "long" : kind, 0, 1);
      return;
    }
  }

  private assignChase() {
    for (const p of this.ps) p.chase = 0;
    const owner = this.ball.owner != null ? this.at(this.ball.owner) : null;
    if (!owner) {
      const ranked = [...this.ps].filter((p) => !p.sent).sort((a, b) => hypot(a.x - this.ball.x, a.z - this.ball.z) - hypot(b.x - this.ball.x, b.z - this.ball.z));
      const n = this.cfg.mode === "practice" ? 1 : 3;
      ranked.slice(0, n).forEach((p) => (p.chase = 1));
      return;
    }
    const def = (1 - owner.team) as 0 | 1;
    const tac = this.sides[def].tactics;
    let n = tac.press > 0.72 || tac.style === "press" ? 3 : tac.press > 0.4 ? 2 : 1;
    if (this.cfg.mode === "practice" && def !== this.cfg.userTeam) n = 1;
    if (this.pressT > 0 && def === this.cfg.userTeam) n += 1;
    const ranked = this.ps.filter((p) => p.team === def && !p.sent && p.role !== "GK").sort((a, b) => hypot(a.x - this.ball.x, a.z - this.ball.z) - hypot(b.x - this.ball.x, b.z - this.ball.z));
    ranked.slice(0, n).forEach((p) => (p.chase = 1));
  }

  private desired(p: SimP): { x: number; z: number } {
    if (p.sent) return { x: 80, z: 0 };
    if (this.piece && this.idx(p) === this.piece.taker) {
      const atk = this.attack[p.team]!;
      return {
        x: this.piece.x - atk * (this.piece.kind === "throw" ? 0 : 1.1),
        z: this.piece.z + (this.piece.kind === "throw" ? (this.piece.z > 0 ? 0.7 : -0.7) : 0),
      };
    }
    const atk = this.attack[p.team]!;
    const own = this.ownX(p.team);
    const tac = this.sides[p.team].tactics;
    const possessing = this.ball.owner != null && this.at(this.ball.owner).team === p.team;
    const ballAlong = clamp(((this.ball.x - own) * atk) / 105, 0, 1);
    let line = 0.14 + tac.depth * 0.16 + ballAlong * (0.22 + tac.depth * 0.38);
    if (!possessing && tac.style === "counter") line -= 0.05;
    if (possessing && tac.style === "press") line += 0.03;
    line = clamp(line, 0.1, 0.7);
    let frac = line + (p.roleX - 0.2) * (0.62 + tac.tempo * 0.18);
    if (possessing && tac.style === "counter" && p.roleX > 0.58) frac += 0.07;
    frac = clamp(frac, 0.05, 0.9);
    let x = own + atk * frac * 100;
    let z = p.roleZ * (22 + tac.width * 12);
    if (possessing && !this.has(p)) z = z * 0.72 + this.ball.z * 0.28;
    if (p.chase > 0) {
      x = this.ball.x - atk * 0.8;
      z = this.ball.z;
    }
    if (p.role === "GK") {
      const rush = p === this.gkRushing(p.team);
      const zc = clamp(this.ball.z * 0.4, -6.5, 6.5);
      const close = Math.abs(this.ball.x - own) < 26;
      const depth = rush ? clamp(Math.abs(this.ball.x - own) * 0.55, 3, 16) : close ? 7 : 2.6;
      x = own + atk * depth;
      z = zc;
    }
    if (this.piece?.kind === "freekick" && this.piece.team !== p.team && p.chase === 0 && p.role !== "GK") {
      const goal = this.ownX(p.team);
      const dx = goal - this.piece.x;
      const dz = 0 - this.piece.z;
      const dist = hypot(dx, dz) || 1;
      if (dist < 34 && p.slot % 4 === 0) {
        x = this.piece.x + (dx / dist) * 9.15;
        z = this.piece.z + (dz / dist) * 9.15 + (p.slot - 5) * 0.7;
      }
    }
    return { x: clamp(x, -50.5, 50.5), z: clamp(z, -32.5, 32.5) };
  }

  private gkRushing(team: 0 | 1) {
    if (this.gkRushT <= 0 || team !== this.cfg.userTeam) return null;
    return this.ps.find((p) => p.team === team && p.role === "GK") ?? null;
  }

  private has(p: SimP) {
    return this.ball.owner === this.idx(p);
  }

  private maxSpeed(p: SimP, sprint: boolean) {
    const d = DIFF[this.cfg.difficulty];
    let s = 4.15 + (p.ref.pac / 100) * 3.7;
    s *= 0.78 + 0.22 * p.stamina;
    if (sprint) s *= 1.2;
    if (this.has(p)) s *= 0.84 + p.ref.dri / 700;
    if (p.team !== this.cfg.userTeam) s *= d.spd;
    if (this.cfg.mode === "practice" && p.team !== this.cfg.userTeam) s *= 0.62;
    return s;
  }

  private moveToward(p: SimP, x: number, z: number, sprint: boolean, dt: number) {
    const dx = x - p.x;
    const dz = z - p.z;
    const dist = hypot(dx, dz);
    const sp = this.maxSpeed(p, sprint && dist > 2);
    let wx = 0;
    let wz = 0;
    if (dist > 0.35) {
      wx = (dx / dist) * sp;
      wz = (dz / dist) * sp;
    }
    const k = 1 - Math.exp(-9 * dt);
    p.vx = lerp(p.vx, wx, k);
    p.vz = lerp(p.vz, wz, k);
    if (hypot(p.vx, p.vz) > 0.4) p.yaw = lerpAng(p.yaw, yawOf(p.vx, p.vz), k);
    if (sprint && dist > 1) p.stamina = clamp(p.stamina - dt * 0.045, 0.25, 1);
    else p.stamina = clamp(p.stamina + dt * 0.02, 0, 1);
  }

  private tryClaim() {
    if (this.ball.freeze || this.ball.y > 2.15) return;
    let best: SimP | null = null;
    let bestD = 99;
    for (const p of this.ps) {
      if (p.sent || p.down > 0) continue;
      const d = hypot(p.x - this.ball.x, p.z - this.ball.z);
      const aerial = this.ball.y > 1.15;
      let reach = aerial ? 1.05 : 1.12;
      if (this.ball.intended === this.idx(p)) reach += 0.45;
      if (p.role === "GK" && this.inOwnBox(p.team, p.x, p.z)) reach += 0.45;
      if (d < reach && d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (!best) return;
    if (this.offside.has(this.idx(best)) && best.team === (this.ball.lastKicker != null ? this.at(this.ball.lastKicker).team : best.team)) {
      this.whistleOffside(best);
      return;
    }
    if (this.ball.lastKicker != null && this.at(this.ball.lastKicker).team !== best.team) this.offside.clear();
    const aerial = this.ball.y > 1.2 && this.ball.y < 2.15;
    if (best.role === "GK" && aerial && this.inOwnBox(best.team, this.ball.x, this.ball.z)) {
      const claim = Math.random() < 0.35 + best.ref.ovr / 180;
      if (claim) {
        this.ball.owner = this.idx(best);
        this.ball.vx = this.ball.vy = this.ball.vz = 0;
        this.ball.shot = false;
        this.ball.y = 0.9;
        best.gkHold = 0.55;
        best.saves += this.ball.shot ? 1 : 0;
        this.fx.push("save");
        return;
      }
    }
    if (aerial) {
      this.header(best);
      return;
    }
    const incoming = hypot(this.ball.vx, this.ball.vz);
    const heavy = incoming > 16 && Math.random() > best.ref.dri / 125;
    if (this.ball.lastPasser != null && this.ball.lastPasser !== this.idx(best) && this.at(this.ball.lastPasser).team === best.team) {
      this.at(this.ball.lastPasser).passesOk++;
      this.passOk[best.team]++;
    }
    if (heavy && best.role !== "GK") {
      this.ball.vx *= 0.25;
      this.ball.vz += (Math.random() - 0.5) * 4;
      this.ball.owner = null;
      this.ball.intended = null;
      return;
    }
    this.ball.owner = this.idx(best);
    this.ball.vx = this.ball.vy = this.ball.vz = 0;
    this.ball.y = 0.22;
    this.ball.shot = false;
    this.ball.intended = null;
    this.ball.freeze = false;
    if (best.team === this.cfg.userTeam && hypot(0, 0) === 0) {
      const userDriving = false;
      void userDriving;
    }
  }

  private header(p: SimP) {
    const opp = (1 - p.team) as 0 | 1;
    const goalX = this.ownX(opp);
    const dist = Math.abs(goalX - p.x);
    this.ball.lastKicker = this.idx(p);
    this.ball.owner = null;
    this.ball.intended = null;
    this.ball.shot = false;
    p.kick = 0.2;
    if (dist < 16 && p.role !== "GK" && p.role !== "CB" && Math.random() < 0.45 + p.ref.sho / 300) {
      this.shoot(p, 0.45, (Math.random() - 0.5) * 2);
      this.log(`${p.ref.name} heads it`);
      return;
    }
    const mate = this.ps.find((m) => m.team === p.team && m !== p && !m.sent && m.roleX > p.roleX - 0.1);
    if (mate) this.passTo(p, "short", 0, 1);
    else {
      this.ball.vx = this.attack[p.team]! * 10;
      this.ball.vz = (Math.random() - 0.5) * 4;
      this.ball.vy = 2;
      this.ball.y = 1.4;
    }
  }

  private gkThink(dt: number) {
    if (!this.ball.shot || this.ball.rolled || this.ball.owner != null) return;
    const goalX = this.ball.vx >= 0 ? HALF_X : -HALF_X;
    if (Math.abs(this.ball.vx) < 2) return;
    const toward = (goalX - this.ball.x) * this.ball.vx > 0;
    if (!toward) return;
    const t = (goalX - this.ball.x) / this.ball.vx;
    if (t < 0 || t > 1.5) return;
    const pz = this.ball.z + this.ball.vz * t;
    const py = this.ball.y + this.ball.vy * t - 0.5 * G * t * t;
    const def: 0 | 1 = (this.attack[0]! > 0) === (goalX < 0) ? 0 : 1;
    const gk = this.ps.find((p) => p.team === def && p.role === "GK" && !p.sent);
    if (!gk) return;
    gk.z = lerp(gk.z, clamp(pz, -6, 6), 1 - Math.exp(-6 * dt));
    if (t > 0.22) return;
    this.ball.rolled = true;
    const inFrame = Math.abs(pz) <= GOAL_W && py > 0 && py < GOAL_H;
    if (!inFrame) return;
    const speed = hypot(this.ball.vx, this.ball.vz);
    const reach = Math.abs(pz - gk.z) < 2.15 + gk.ref.ovr / 90 && py < 2.35;
    let chance = reach ? clamp(0.18 + gk.ref.ovr / 120 - speed / 95 - Math.abs(pz) / 9, 0.06, 0.9) : 0.04;
    if (speed < 18 && Math.abs(pz) < 1.15 && py < 1.35) chance = Math.max(chance, 0.55 + gk.ref.ovr / 250);
    if (this.cfg.mode === "practice" && def !== this.cfg.userTeam) chance *= 0.45;
    if (Math.random() < chance) {
      gk.saves++;
      gk.dive = 0.7;
      gk.diveDir = Math.sign(pz - gk.z) || 1;
      this.fx.push("save");
      this.log(`Saved — ${gk.ref.name}`);
      if (speed > 24 || Math.abs(pz) > 2) {
        this.ball.vx *= -0.32;
        this.ball.vz = (Math.random() - 0.5) * 8;
        this.ball.vy = 2.4;
        this.ball.shot = false;
        this.ball.owner = null;
      } else {
        this.ball.owner = this.idx(gk);
        this.ball.vx = this.ball.vy = this.ball.vz = 0;
        this.ball.shot = false;
        gk.gkHold = 0.6;
      }
    }
  }

  private integrateBall(h: number) {
    if (this.ball.owner != null) {
      const p = this.at(this.ball.owner);
      if (p.sent) {
        this.ball.owner = null;
        return;
      }
      const fx = -Math.sin(p.yaw);
      const fz = -Math.cos(p.yaw);
      this.ball.x = p.x + fx * 0.62;
      this.ball.z = p.z + fz * 0.62;
      this.ball.y = p.role === "GK" && p.gkHold > 0 ? 0.9 : 0.22;
      this.ball.vx = p.vx;
      this.ball.vz = p.vz;
      this.ball.vy = 0;
      return;
    }
    if (this.ball.freeze) return;
    const px = this.ball.x;
    const py = this.ball.y;
    const pz = this.ball.z;
    this.ball.vy -= G * h;
    this.ball.x += this.ball.vx * h;
    this.ball.y += this.ball.vy * h;
    this.ball.z += this.ball.vz * h;
    if (this.ball.y <= 0.22) {
      this.ball.y = 0.22;
      if (this.ball.vy < 0) this.ball.vy = this.ball.vy < -3 ? -this.ball.vy * 0.42 : 0;
      const sp = hypot(this.ball.vx, this.ball.vz);
      const fr = (this.cfg.weather === "rain" ? 1.3 : 3.4) * h;
      if (sp > 0.02) {
        const k = Math.max(0, sp - fr) / sp;
        this.ball.vx *= k;
        this.ball.vz *= k;
      }
    }
    for (const goalX of [HALF_X, -HALF_X]) {
      if ((px - goalX) * (this.ball.x - goalX) < 0) {
        const denom = this.ball.x - px || 0.0001;
        const u = (goalX - px) / denom;
        const cz = pz + (this.ball.z - pz) * u;
        const cy = py + (this.ball.y - py) * u;
        const def: 0 | 1 = (this.attack[0]! > 0) === (goalX < 0) ? 0 : 1;
        const att = (1 - def) as 0 | 1;
        if (Math.abs(cz) <= GOAL_W && cy >= 0 && cy <= GOAL_H) {
          const kicker = this.ball.lastKicker != null ? this.at(this.ball.lastKicker) : null;
          const og = !kicker || kicker.team === def;
          this.scoreGoal(att, og);
          this.ball.x = goalX + Math.sign(goalX) * 0.4;
          this.ball.y = clamp(cy, 0.3, 2.2);
          this.ball.z = cz;
          this.ball.vx *= 0.2;
          return;
        }
        const last = this.ball.lastKicker != null ? this.at(this.ball.lastKicker).team : att;
        if (last === att) this.setPiece("goalkick", def, goalX + (goalX > 0 ? -6 : 6), cz > 0 ? 12 : -12);
        else this.setPiece("corner", att, goalX, cz > 0 ? 1 : -1);
        return;
      }
    }
    if (Math.abs(this.ball.z) > HALF_Z) {
      const last = this.ball.lastKicker != null ? this.at(this.ball.lastKicker).team : 0;
      const team = (1 - last) as 0 | 1;
      this.setPiece("throw", team, clamp(this.ball.x, -HALF_X + 1, HALF_X - 1), this.ball.z);
    }
  }

  private tackle(by: SimP, slide: boolean) {
    const owner = this.ball.owner != null ? this.at(this.ball.owner) : null;
    if (!owner || owner.team === by.team) {
      if (slide) {
        by.down = 0.7;
        const fx = -Math.sin(by.yaw);
        const fz = -Math.cos(by.yaw);
        by.vx += fx * 7;
        by.vz += fz * 7;
      }
      return;
    }
    const d = hypot(owner.x - by.x, owner.z - by.z);
    if (d > (slide ? 2.5 : 1.75)) {
      if (slide) by.down = 0.65;
      return;
    }
    const faceDot = ((owner.x - by.x) * -Math.sin(owner.yaw) + (owner.z - by.z) * -Math.cos(owner.yaw)) / (d || 1);
    const fromBehind = faceDot > 0.35;
    const success = (by.ref.def + 12) / (by.ref.def + owner.ref.dri + 18) * (slide ? 0.82 : 1) * (fromBehind ? 0.8 : 1.05);
    by.kick = 0.2;
    if (Math.random() < success) {
      by.tackles++;
      this.ball.owner = slide ? null : this.idx(by);
      this.ball.shot = false;
      this.ball.lastKicker = this.idx(by);
      this.ball.lastPasser = null;
      this.offside.clear();
      if (!slide) {
        this.ball.vx = 0;
        this.ball.vz = 0;
      } else {
        this.ball.vx = (Math.random() - 0.5) * 6;
        this.ball.vz = (Math.random() - 0.5) * 6;
        this.ball.owner = null;
        by.down = 0.45;
      }
      this.fx.push("kick");
    } else {
      by.down = slide ? 0.85 : 0.25;
      if (Math.random() < (slide ? 0.38 : fromBehind ? 0.28 : 0.12)) this.foul(by, owner.x, owner.z, slide);
    }
  }

  private takePiece(input: Input) {
    const piece = this.piece;
    if (!piece) return;
    const taker = this.at(piece.taker);
    const user = taker.team === this.cfg.userTeam;
    const want = input.pass || input.through || input.cross || input.shootRelease || (!user && piece.timer > 0.9 + Math.random() * 0.5) || (user && piece.timer > 7);
    piece.timer += 1 / 60;
    if (!want) return;
    if (piece.kind === "penalty") {
      const aim = user ? input.ax * 3.4 : (Math.random() - 0.5) * 4.2;
      const power = user ? clamp(this.power || 0.55, 0.35, 1) : 0.6 + Math.random() * 0.3;
      this.shoot(taker, power, aim);
      return;
    }
    if (piece.kind === "goalkick") {
      this.passTo(taker, "long", user ? input.ax : (Math.random() - 0.5) * 1.4, 1);
      return;
    }
    if (piece.kind === "corner") {
      this.passTo(taker, input.pass && !input.cross ? "short" : "cross", user ? input.ax : 0, 1);
      return;
    }
    if (input.shootRelease && piece.kind === "freekick") {
      const opp = (1 - taker.team) as 0 | 1;
      if (Math.abs(this.ownX(opp) - piece.x) < 32) {
        this.shoot(taker, clamp(this.power || 0.6, 0.4, 1), user ? input.ax * 3 : (Math.random() - 0.5) * 2);
        return;
      }
    }
    const kind = input.through ? "through" : input.cross ? "cross" : "short";
    this.passTo(taker, kind, user ? input.ax : 0, user ? input.ay || 1 : 1);
  }

  private stepShootout(input: Input, dt: number) {
    this.penWait -= dt;
    const homeTaken = this.pens.filter((p) => p.team === 0).length;
    const awayTaken = this.pens.filter((p) => p.team === 1).length;
    if (this.penResolved && this.finishedPens()) {
      this.phase = "fulltime";
      this.ended = true;
      this.fx.push("whistle");
      return;
    }
    if (!this.penResolved) {
      if (this.penWait <= 0) this.penResolved = true;
      return;
    }
    const team = this.penTeam;
    this.userKick = team === this.cfg.userTeam;
    const taker = this.pickTaker(team, "ST");
    const gk = this.ps.find((p) => p.team === (1 - team) && p.role === "GK")!;
    const goalX = this.ownX((1 - team) as 0 | 1);
    taker.x = goalX + (goalX > 0 ? -12 : 12);
    taker.z = 0;
    gk.x = goalX + (goalX > 0 ? -1 : 1);
    gk.z = 0;
    this.ball.x = taker.x + (goalX > 0 ? 1 : -1);
    this.ball.z = 0;
    this.ball.y = 0.22;
    this.ball.owner = this.idx(taker);
    if (this.userKick) {
      if (!input.shootRelease && this.penWait < -6) {
        /* keep waiting, but don't soft-lock forever */
      }
      if (!input.shootRelease && this.pens.length === homeTaken + awayTaken) {
        this.penWait = 0;
        if (!input.shootHeld && this.powerOn === false) {
          /* idle */
        }
      }
      const waited = this.penWait < -8;
      if (!(input.shootRelease || waited)) return;
      this.resolvePen(taker, gk, input.ax * 3.3, clamp(this.power || 0.62, 0.4, 1), this.cfg.userTeam === gk.team ? 0 : input.ax * 2.2);
    } else {
      if (this.penWait > -0.8) return;
      const aim = (Math.random() - 0.5) * 4;
      const userDive = gk.team === this.cfg.userTeam ? input.ax * 3.1 : (Math.random() - 0.5) * 3;
      this.resolvePen(taker, gk, aim, 0.55 + Math.random() * 0.35, userDive);
    }
  }

  private resolvePen(taker: SimP, gk: SimP, aimZ: number, power: number, diveZ: number) {
    const on = Math.abs(aimZ) < 3.55 && power > 0.25;
    const scored = on && Math.abs(aimZ - diveZ) > 1.15 + (1 - gk.ref.ovr / 140);
    this.pens.push({ team: taker.team, scored });
    if (scored) {
      this.score[taker.team]++;
      taker.goals++;
      this.scorers.push({ name: `${taker.ref.name} (pen)`, team: taker.team, minute: "PEN" });
      this.fx.push("goal");
      this.log(`Penalty scored — ${taker.ref.name}`);
    } else {
      gk.saves += on ? 1 : 0;
      gk.dive = 0.8;
      gk.diveDir = Math.sign(diveZ || aimZ) || 1;
      this.fx.push(on ? "save" : "kick");
      this.log(on ? `Penalty saved — ${gk.ref.name}` : `Penalty missed — ${taker.ref.name}`);
    }
    this.penTeam = (1 - taker.team) as 0 | 1;
    this.penResolved = false;
    this.penWait = 1.15;
    this.power = 0;
    this.powerOn = false;
  }

  private finishedPens() {
    const a = this.pens.filter((p) => p.team === 0);
    const b = this.pens.filter((p) => p.team === 1);
    const as = a.filter((p) => p.scored).length;
    const bs = b.filter((p) => p.scored).length;
    if (a.length < 5 || b.length < 5) {
      const aLeft = 5 - a.length;
      const bLeft = 5 - b.length;
      if (as > bs + bLeft) return true;
      if (bs > as + aLeft) return true;
      return false;
    }
    if (a.length === b.length && as !== bs) return true;
    return false;
  }

  private beginShootout() {
    this.phase = "shootout";
    this.pens = [];
    this.penTeam = Math.random() < 0.5 ? 0 : 1;
    this.penResolved = true;
    this.penWait = 0.4;
    this.score = [0, 0];
    this.log("Penalty shootout");
    this.fx.push("whistle");
  }

  private endPeriod() {
    this.fx.push("whistle");
    if (this.period === 1) {
      this.phase = "halftime";
      this.log("Half-time");
      return;
    }
    if (this.period === 2) {
      if (this.cfg.knockout && this.score[0] === this.score[1] && this.cfg.mode === "match") {
        this.phase = "extrabreak";
        this.log("Extra time");
        return;
      }
      this.finish();
      return;
    }
    if (this.period === 3) {
      this.phase = "extrabreak";
      this.log("Extra half-time");
      return;
    }
    if (this.score[0] === this.score[1]) this.beginShootout();
    else this.finish();
  }

  private finish() {
    this.phase = "fulltime";
    this.ended = true;
    this.log("Full-time");
    this.fx.push("whistle");
  }

  continueBreak() {
    if (this.phase === "halftime") {
      this.period = 2;
      this.clock = 0;
      this.attack = [-this.attack[0]!, -this.attack[1]!];
      this.placeAll();
      this.beginKickoff(this.firstKick === 0 ? 1 : 0);
      return;
    }
    if (this.phase === "extrabreak") {
      const toExtra = this.period === 2;
      this.period = toExtra ? 3 : 4;
      this.clock = 0;
      this.periodLen = Math.max(20, this.cfg.lengthSec / 6);
      if (toExtra) this.attack = [-this.attack[0]!, -this.attack[1]!];
      else this.attack = [-this.attack[0]!, -this.attack[1]!];
      this.placeAll();
      this.beginKickoff(toExtra ? 0 : 1);
    }
  }

  private stepPlayers(input: Input, dt: number) {
    const user = this.ps[this.controlled];
    const mag = hypot(input.ax, input.ay);
    const userDriving = !!user && mag > 0.14 && user.team === this.cfg.userTeam && !user.sent;
    if (input.switchPlayer && !this.cfg.lockId) {
      const mates = this.ps.filter((p) => p.team === this.cfg.userTeam && !p.sent && this.idx(p) !== this.controlled);
      mates.sort((a, b) => hypot(a.x - this.ball.x, a.z - this.ball.z) - hypot(b.x - this.ball.x, b.z - this.ball.z));
      if (mates[0]) this.controlled = this.idx(mates[0]);
    }
    if (input.press) this.pressT = 2.2;
    if (input.gkRush) this.gkRushT = 1.6;
    this.pressT = Math.max(0, this.pressT - dt);
    this.gkRushT = Math.max(0, this.gkRushT - dt);

    for (const p of this.ps) {
      const i = this.idx(p);
      p.kick = Math.max(0, p.kick - dt);
      p.dive = Math.max(0, p.dive - dt);
      p.down = Math.max(0, p.down - dt);
      p.gkHold = Math.max(0, p.gkHold - dt);
      p.skillCd = Math.max(0, p.skillCd - dt);
      if (p.sent || p.down > 0) {
        p.vx *= 0.9;
        p.vz *= 0.9;
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        continue;
      }
      const manual = userDriving && i === this.controlled;
      if (manual && user) {
        const atk = this.attack[this.cfg.userTeam]!;
        const m = Math.min(1, mag);
        const nx = input.ax / mag;
        const ny = input.ay / mag;
        const sp = this.maxSpeed(p, input.sprint) * m;
        const wx = ny * atk * sp;
        const wz = nx * atk * sp;
        const k = 1 - Math.exp(-12 * dt);
        p.vx = lerp(p.vx, wx, k);
        p.vz = lerp(p.vz, wz, k);
        p.yaw = lerpAng(p.yaw, yawOf(wx, wz), k);
        if (input.sprint) p.stamina = clamp(p.stamina - dt * 0.05, 0.22, 1);
        else p.stamina = clamp(p.stamina + dt * 0.018, 0, 1);
        if (input.skill && this.has(p) && p.skillCd <= 0) {
          p.vx += -input.ax * atk * 5;
          p.vz += input.ay * atk * 3.5;
          p.skillCd = 1.3;
          p.kick = 0.35;
          this.fx.push("kick");
        }
      } else {
        const des = this.desired(p);
        const chasing = p.chase > 0 && !this.has(p);
        this.moveToward(p, des.x, des.z, chasing || (this.has(p) && p.team !== this.cfg.userTeam), dt);
      }
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.x = clamp(p.x, -51.5, 51.5);
      p.z = clamp(p.z, -33, 33);
    }

    for (let i = 0; i < this.ps.length; i++) {
      for (let j = i + 1; j < this.ps.length; j++) {
        const a = this.ps[i]!;
        const b = this.ps[j]!;
        if (a.sent || b.sent) continue;
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = hypot(dx, dz);
        if (d > 0.01 && d < 1.55) {
          const push = ((1.55 - d) / d) * 0.35;
          a.x -= dx * push;
          a.z -= dz * push;
          b.x += dx * push;
          b.z += dz * push;
        }
      }
    }
  }

  private actHuman(input: Input) {
    const p = this.ps[this.controlled];
    if (!p || p.sent || p.team !== this.cfg.userTeam) return;
    const mine = this.has(p) || (this.piece && this.piece.taker === this.idx(p));
    if (input.shootHeld && mine) {
      this.powerOn = true;
      this.power = clamp(this.power + 1 / 60 * 1.35, 0, 1);
    }
    if (input.tackle || input.slide) this.tackle(p, input.slide);
    if (!mine) return;
    if (this.piece) return;
    if (input.pass) this.passTo(p, "short", input.ax, input.ay || 1);
    else if (input.through) this.passTo(p, "through", input.ax, input.ay || 1);
    else if (input.cross) this.passTo(p, "cross", input.ax, input.ay || 1);
    else if (input.shootRelease) this.shoot(p, clamp(this.power || 0.42, 0.34, 1), p.z * 0.2 + input.ax * 3.1);
    if (this.has(p)) {
      const atk = this.attack[p.team]!;
      this.aim = { x: p.x + input.ay * atk * 12, z: p.z + input.ax * atk * 12 };
    }
  }

  step(input: Input, dt: number) {
    if (this.phase === "halftime" || this.phase === "fulltime" || this.phase === "extrabreak") return;
    if (this.phase === "shootout") {
      this.stepShootout(input, dt);
      return;
    }
    if (this.phase === "goal") {
      this.celT -= dt;
      this.shake = Math.max(0, this.shake - dt);
      const scorer = [...this.ps].reverse().find((p) => p.team === this.goalSide && p.goals > 0);
      if (scorer) {
        scorer.vx = this.attack[scorer.team]! * 3;
        scorer.x += scorer.vx * dt;
      }
      if (this.celT <= 0) {
        if (this.trail.length > 8) {
          this.phase = "replay";
          this.replay = 0;
          this.replayLen = Math.min(2.6, this.trail.length * 0.1);
        } else {
          this.beginKickoff((1 - this.goalSide) as 0 | 1);
        }
      }
      return;
    }
    if (this.phase === "replay") {
      this.replay += dt;
      const u = clamp(this.replay / this.replayLen, 0, 1);
      const f = u * (this.trail.length - 1);
      const i0 = Math.floor(f);
      const i1 = Math.min(this.trail.length - 1, i0 + 1);
      const a = this.trail[i0];
      const b = this.trail[i1];
      if (a && b) {
        const t = f - i0;
        this.ball.x = lerp(a.bx, b.bx, t);
        this.ball.y = lerp(a.by, b.by, t);
        this.ball.z = lerp(a.bz, b.bz, t);
        this.ps.forEach((p, i) => {
          p.x = lerp(a.px[i] ?? p.x, b.px[i] ?? p.x, t);
          p.z = lerp(a.pz[i] ?? p.z, b.pz[i] ?? p.z, t);
        });
      }
      if (this.replay >= this.replayLen) this.beginKickoff((1 - this.goalSide) as 0 | 1);
      return;
    }

    const dead = this.phase !== "play";
    if (!dead && this.cfg.mode !== "practice") {
      this.clock += dt;
      if (this.clock >= this.periodLen + 6) this.endPeriod();
    }

    const live = this.phase === "play" || this.piece != null;
    if (this.piece) this.takePiece(input);
    if (live) {
      if (this.phase === "play") {
        this.aiT -= dt;
        if (this.aiT <= 0) {
          this.aiT = 0.22;
          this.assignChase();
          const owner = this.ball.owner != null ? this.at(this.ball.owner) : null;
          if (owner && owner.gkHold <= 0) {
            const human = this.idx(owner) === this.controlled && owner.team === this.cfg.userTeam;
            if (!human) this.decideCarrier(owner);
          }
        }
      }
      this.stepPlayers(input, dt);
      if (this.phase === "play") this.actHuman(input);
      if (this.ball.owner != null && this.phase === "play") {
        const o = this.at(this.ball.owner);
        if (o.team === this.cfg.userTeam && !this.cfg.lockId && this.idx(o) !== this.controlled && hypot(input.ax, input.ay) < 0.2) {
          this.controlled = this.idx(o);
        }
      }
    }

    if (!input.shootHeld && !input.shootRelease) {
      this.power = 0;
      this.powerOn = false;
    }

    if (this.ball.owner == null && !this.ball.freeze) this.tryClaim();
    this.gkThink(dt);
    const sub = 4;
    for (let s = 0; s < sub; s++) {
      if (this.phase === "goal" || this.phase === "replay") break;
      this.integrateBall(dt / sub);
      if (this.phase !== "play" && this.piece) break;
    }
    this.ball.passT += dt;
    if (this.ball.owner != null) {
      const t = this.at(this.ball.owner).team;
      this.possT[t] += dt;
    }
    if (this.phase === "play") {
      this.trailAcc += dt;
      if (this.trailAcc >= 0.1) {
        this.trailAcc = 0;
        const px = new Float32Array(this.ps.length);
        const pz = new Float32Array(this.ps.length);
        this.ps.forEach((p, i) => {
          px[i] = p.x;
          pz[i] = p.z;
        });
        this.trail.push({ bx: this.ball.x, by: this.ball.y, bz: this.ball.z, px, pz });
        if (this.trail.length > 60) this.trail.shift();
      }
    }

    const gk = this.ps.find((p) => this.has(p) && p.role === "GK" && p.gkHold <= 0 && p.team !== this.cfg.userTeam);
    if (gk && Math.random() < dt * 0.8) this.passTo(gk, "long", 0, 1);
  }

  practiceReset() {
    this.phase = "play";
    this.piece = null;
    this.ball.freeze = false;
    const p = this.ps[this.controlled] ?? this.ps[0]!;
    this.ball.owner = this.idx(p);
    this.ball.x = p.x;
    this.ball.z = p.z;
    this.ball.y = 0.22;
    this.ball.vx = this.ball.vy = this.ball.vz = 0;
    this.ball.shot = false;
  }

  substitute(team: 0 | 1, slot: number, playerId: string) {
    if (!this.subWindow && this.phase !== "halftime" && this.phase !== "extrabreak") return false;
    if (this.subs[team] >= 5) return false;
    const p = this.ps.find((s) => s.team === team && s.slot === slot);
    if (!p || p.sent) return false;
    const side = this.sides[team];
    const bi = side.bench.findIndex((b) => b.id === playerId);
    if (bi < 0) return false;
    const incoming = side.bench.splice(bi, 1)[0]!;
    side.bench.push(p.ref);
    side.xi[slot] = incoming;
    p.ref = incoming;
    p.stamina = 1;
    p.yellow = 0;
    this.subs[team]++;
    this.log(`Sub — ${incoming.name} for ${side.bench[side.bench.length - 1]?.name ?? "out"}`);
    return true;
  }

  applyFormation(team: 0 | 1, formation = this.sides[team].tactics.formation) {
    const slots = FORMATIONS[formation];
    const group = this.ps.filter((p) => p.team === team && !p.sent);
    const used = new Set<number>();
    for (const p of group) {
      let best = 0;
      let bs = -99;
      slots.forEach((sl, i) => {
        if (used.has(i)) return;
        const sc = fitScore(p.ref.pos, sl.pos);
        if (sc > bs) {
          bs = sc;
          best = i;
        }
      });
      used.add(best);
      const sl = slots[best]!;
      p.roleX = sl.x;
      p.roleZ = sl.z;
      p.role = sl.pos;
    }
  }

  controlledSpeed() {
    const p = this.ps[this.controlled];
    if (!p) return 0;
    return hypot(p.vx, p.vz);
  }

  controlledYaw() {
    return this.ps[this.controlled]?.yaw ?? 0;
  }

  renderPlayers(): RenderPlayer[] {
    return this.ps.map((p) => ({
      id: p.ref.id,
      team: p.team,
      x: p.x,
      z: p.z,
      yaw: p.yaw,
      speed: hypot(p.vx, p.vz),
      kick: p.kick,
      down: p.down,
      dive: p.dive,
      diveDir: p.diveDir,
      sent: p.sent,
      gk: p.role === "GK",
      num: p.ref.num,
      height: p.ref.height,
      skin: p.ref.visual.skin,
      hair: p.ref.visual.hair,
      hairStyle: p.ref.visual.hairStyle,
      bulk: p.ref.visual.bulk,
      name: p.ref.name,
    }));
  }

  ratingOf(p: SimP) {
    const r = 6.15 + p.goals * 1.05 + p.assists * 0.7 + p.shots * 0.08 + p.tackles * 0.09 + p.passesOk * 0.012 + p.saves * 0.32 - p.fouls * 0.18 - (p.sent ? 0.8 : p.yellow * 0.25);
    return clamp(Math.round(r * 10) / 10, 3.2, 10);
  }

  snap(): Snap {
    const poss = this.possT[0] + this.possT[1];
    const acc = (t: 0 | 1) => (this.passAtt[t] ? Math.round((this.passOk[t] / this.passAtt[t]) * 100) : 0);
    const me = this.ps[this.controlled];
    const team = this.cfg.userTeam;
    const side = this.sides[team];
    const pensH = this.pens.filter((p) => p.team === 0 && p.scored).length;
    const pensA = this.pens.filter((p) => p.team === 1 && p.scored).length;
    return {
      phase: this.phase,
      minute: this.cfg.mode === "practice" ? "TRN" : this.minuteLabel(),
      score: [...this.score],
      pens: this.pens.length ? [pensH, pensA] : null,
      names: [this.cfg.home.name, this.cfg.away.name],
      shorts: [this.cfg.home.short, this.cfg.away.short],
      kits: [this.cfg.home.kit, this.cfg.away.kit],
      poss: poss > 0 ? this.possT[0] / poss : 0.5,
      shots: [...this.shots],
      sot: [...this.sot],
      fouls: [...this.fouls],
      corners: [...this.corners],
      passAcc: [acc(0), acc(1)],
      yellow: [...this.yellows],
      red: [...this.reds],
      event: this.feed[0] ?? "",
      feed: [...this.feed],
      power: this.powerOn || this.power > 0 ? this.power : 0,
      stamina: me?.stamina ?? 1,
      controlled: me?.ref.name ?? "",
      controlledPos: me?.role ?? "",
      scorers: this.scorers,
      ratings: this.ps.filter((p) => !p.sent || p.goals).map((p) => ({
        id: p.ref.id,
        name: p.ref.name,
        team: p.team,
        pos: p.role,
        rating: this.ratingOf(p),
        goals: p.goals,
        assists: p.assists,
      })),
      shootout: this.phase === "shootout" ? {
        team: this.penTeam,
        taken: this.pens,
        userKick: this.penTeam === this.cfg.userTeam && this.penResolved,
        hint: this.penTeam === this.cfg.userTeam ? "Aim with the stick, hold shoot, release" : "Move the stick to dive",
      } : null,
      subsLeft: [5 - this.subs[0], 5 - this.subs[1]],
      xi: this.ps.filter((p) => p.team === team).map((p) => ({
        slot: p.slot,
        id: p.ref.id,
        name: p.ref.name,
        pos: p.role,
        ovr: p.ref.ovr,
        rating: this.ratingOf(p),
      })),
      bench: side.bench.map((p) => ({ id: p.id, name: p.name, pos: p.pos, ovr: p.ovr })),
      aim: this.aim,
      stadium: this.cfg.home.stadium,
      userTeam: team,
      lockId: this.cfg.lockId,
    };
  }

  result() {
    const s = this.snap();
    const ratings = [...s.ratings].sort((a, b) => b.rating - a.rating);
    return {
      home: this.score[0],
      away: this.score[1],
      pens: s.pens,
      shots: s.shots,
      sot: s.sot,
      fouls: s.fouls,
      corners: s.corners,
      passAcc: s.passAcc,
      poss: s.poss,
      yellow: s.yellow,
      red: s.red,
      scorers: s.scorers,
      ratings,
      feed: s.feed,
      potm: ratings[0],
    };
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
    };
  }
}
