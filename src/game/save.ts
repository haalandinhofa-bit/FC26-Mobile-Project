import type { Settings } from "@/game/types";
import { DEFAULT_SETTINGS } from "@/game/types";
import type { Player, Tactics } from "@/game/types";

export type Fixture = {
  id: string;
  round: number;
  comp: "league" | "cup";
  home: string;
  away: string;
  hg: number | null;
  ag: number | null;
  pens?: [number, number];
};

export type TableRow = {
  id: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
};

export type CareerSave = {
  id: string;
  kind: "manager" | "player";
  name: string;
  clubId: string;
  leagueId: string;
  season: number;
  created: number;
  budget: number;
  confidence: number;
  reputation: number;
  tactics: Tactics;
  squad: Player[];
  others: Record<string, Player[]>;
  fixtures: Fixture[];
  tableIds: string[];
  cup: { teams: string[]; round: number; alive: boolean; bracket: Fixture[] };
  messages: string[];
  trophies: string[];
  stats: { played: number; won: number; drawn: number; lost: number; gf: number; ga: number };
  trains: number;
  playerId?: string;
  personal: { goals: number; assists: number; ratings: number[]; apps: number };
};

export type Store = {
  version: 1;
  settings: Settings;
  slots: (CareerSave | null)[];
  tournament: TournamentSave | null;
  career: { matches: number; goals: number; wins: number };
};

export type TournamentSave = {
  name: string;
  kind: "club" | "nation";
  userId: string;
  teams: string[];
  groups: [string[], string[]];
  fixtures: Fixture[];
  stage: "group" | "semi" | "final" | "done";
  semis: Fixture[];
  final: Fixture | null;
  third: Fixture | null;
  difficulty: Settings["difficulty"];
  lengthMin: Settings["lengthMin"];
  weather: "night" | "day" | "overcast" | "rain";
  knockout: boolean;
};

const KEY = "ninety-save-v1";

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16);
}

export function emptyStore(): Store {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    slots: [null, null, null],
    tournament: null,
    career: { matches: 0, goals: 0, wins: 0 },
  };
}

export function loadStore(): Store {
  if (typeof localStorage === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const wrapped = JSON.parse(raw) as { payload: string; hash: string };
    if (!wrapped?.payload || hash(wrapped.payload) !== wrapped.hash) return emptyStore();
    const data = JSON.parse(wrapped.payload) as Store;
    if (data.version !== 1 || !Array.isArray(data.slots)) return emptyStore();
    return {
      ...emptyStore(),
      ...data,
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      slots: [data.slots[0] ?? null, data.slots[1] ?? null, data.slots[2] ?? null],
    };
  } catch {
    return emptyStore();
  }
}

export function writeStore(store: Store): { ok: boolean; error?: string } {
  if (typeof localStorage === "undefined") return { ok: false, error: "Storage is not available in this browser." };
  try {
    const payload = JSON.stringify(store);
    localStorage.setItem(KEY, JSON.stringify({ payload, hash: hash(payload) }));
    const check = localStorage.getItem(KEY);
    if (!check) return { ok: false, error: "The browser refused the save." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Save failed. Browser storage may be full or blocked." };
  }
}

export function exportStore(store: Store): string {
  return JSON.stringify(store);
}

export function importStore(text: string): Store | null {
  try {
    const data = JSON.parse(text) as Store;
    if (data.version !== 1 || !Array.isArray(data.slots)) return null;
    return {
      ...emptyStore(),
      ...data,
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      slots: [data.slots[0] ?? null, data.slots[1] ?? null, data.slots[2] ?? null],
    };
  } catch {
    return null;
  }
}

export function tableFrom(ids: string[], fixtures: Fixture[]): TableRow[] {
  const rows: Record<string, TableRow> = {};
  for (const id of ids) rows[id] = { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  for (const f of fixtures) {
    if (f.comp !== "league" || f.hg == null || f.ag == null) continue;
    const h = rows[f.home];
    const a = rows[f.away];
    if (!h || !a) continue;
    h.p++;
    a.p++;
    h.gf += f.hg;
    h.ga += f.ag;
    a.gf += f.ag;
    a.ga += f.hg;
    if (f.hg > f.ag) {
      h.w++;
      h.pts += 3;
      a.l++;
    } else if (f.hg < f.ag) {
      a.w++;
      a.pts += 3;
      h.l++;
    } else {
      h.d++;
      a.d++;
      h.pts++;
      a.pts++;
    }
  }
  return Object.values(rows).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
}

export function roundRobin(ids: string[], comp: "league" | "cup"): Fixture[] {
  const list = [...ids];
  if (list.length < 2) return [];
  if (list.length % 2) list.push("BYE");
  const n = list.length;
  const rounds = n - 1;
  const half = n / 2;
  let arr = [...list];
  const out: Fixture[] = [];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i]!;
      const b = arr[n - 1 - i]!;
      if (a === "BYE" || b === "BYE") continue;
      const swap = (r + i) % 2 === 1;
      out.push({
        id: `${comp}-${r}-${a}-${b}`,
        round: r,
        comp,
        home: swap ? b : a,
        away: swap ? a : b,
        hg: null,
        ag: null,
      });
    }
    arr = [arr[0]!, arr[n - 1]!, ...arr.slice(1, n - 1)];
  }
  return out;
}
