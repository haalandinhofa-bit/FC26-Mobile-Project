import type { TournamentSave } from "@/game/save";
import type { Fixture } from "@/game/save";
import type { Settings, Weather } from "@/game/types";

function pairs(ids: string[], prefix: string): Fixture[] {
  const out: Fixture[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      out.push({
        id: `${prefix}-${ids[i]}-${ids[j]}`,
        round: 0,
        comp: "cup",
        home: ids[i]!,
        away: ids[j]!,
        hg: null,
        ag: null,
      });
    }
  }
  return out;
}

export function createTournament(opts: {
  name: string;
  kind: "club" | "nation";
  userId: string;
  pool: string[];
  difficulty: Settings["difficulty"];
  lengthMin: Settings["lengthMin"];
  weather: Weather;
}): TournamentSave {
  const rest = opts.pool.filter((id) => id !== opts.userId).sort(() => Math.random() - 0.5);
  const teams = [opts.userId, ...rest].slice(0, 8);
  const groups: [string[], string[]] = [teams.slice(0, 4), teams.slice(4, 8)];
  const fixtures = [...pairs(groups[0], "g0"), ...pairs(groups[1], "g1")];
  return {
    name: opts.name,
    kind: opts.kind,
    userId: opts.userId,
    teams,
    groups,
    fixtures,
    stage: "group",
    semis: [],
    final: null,
    third: null,
    difficulty: opts.difficulty,
    lengthMin: opts.lengthMin,
    weather: opts.weather,
    knockout: true,
  };
}

export function groupTable(ids: string[], fixtures: Fixture[]) {
  const rows = ids.map((id) => ({ id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  const map = Object.fromEntries(rows.map((r) => [r.id, r]));
  for (const f of fixtures) {
    if (f.hg == null || f.ag == null) continue;
    if (!map[f.home] || !map[f.away]) continue;
    const h = map[f.home]!;
    const a = map[f.away]!;
    h.p++;
    a.p++;
    h.gf += f.hg;
    a.gf += f.ag;
    a.ga += f.hg;
    h.ga += f.ag;
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
  return rows.sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
}

function winner(f: Fixture) {
  if (f.hg == null || f.ag == null) return null;
  if (f.hg === f.ag) return (f.pens?.[0] ?? 0) >= (f.pens?.[1] ?? 1) ? f.home : f.away;
  return f.hg > f.ag ? f.home : f.away;
}

function loser(f: Fixture) {
  const w = winner(f);
  if (!w) return null;
  return w === f.home ? f.away : f.home;
}

export function nextTie(t: TournamentSave): Fixture | null {
  if (t.stage === "group") return t.fixtures.find((f) => f.hg == null && (f.home === t.userId || f.away === t.userId)) ?? null;
  if (t.stage === "semi") return t.semis.find((f) => f.hg == null && (f.home === t.userId || f.away === t.userId)) ?? null;
  if (t.stage === "final") {
    if (t.final && t.final.hg == null && (t.final.home === t.userId || t.final.away === t.userId)) return t.final;
    if (t.third && t.third.hg == null && (t.third.home === t.userId || t.third.away === t.userId)) return t.third;
  }
  return null;
}

export function recordTie(t: TournamentSave, id: string, hg: number, ag: number, pens?: [number, number] | null): TournamentSave {
  const patch = (f: Fixture): Fixture => (f.id === id ? { ...f, hg, ag, pens: pens ?? undefined } : { ...f });
  let next: TournamentSave = {
    ...t,
    fixtures: t.fixtures.map(patch),
    semis: t.semis.map(patch),
    final: t.final && t.final.id === id ? { ...t.final, hg, ag, pens: pens ?? undefined } : t.final,
    third: t.third && t.third.id === id ? { ...t.third, hg, ag, pens: pens ?? undefined } : t.third,
  };
  if (next.stage === "group" && next.fixtures.every((f) => f.hg != null)) {
    const a = groupTable(next.groups[0], next.fixtures);
    const b = groupTable(next.groups[1], next.fixtures);
    next = {
      ...next,
      stage: "semi",
      semis: [
        { id: "sf1", round: 1, comp: "cup", home: a[0]!.id, away: b[1]!.id, hg: null, ag: null },
        { id: "sf2", round: 1, comp: "cup", home: b[0]!.id, away: a[1]!.id, hg: null, ag: null },
      ],
    };
  }
  if (next.stage === "semi" && next.semis.every((f) => f.hg != null)) {
    const w1 = winner(next.semis[0]!)!;
    const w2 = winner(next.semis[1]!)!;
    const l1 = loser(next.semis[0]!)!;
    const l2 = loser(next.semis[1]!)!;
    next = {
      ...next,
      stage: "final",
      final: { id: "final", round: 2, comp: "cup", home: w1, away: w2, hg: null, ag: null },
      third: { id: "third", round: 2, comp: "cup", home: l1, away: l2, hg: null, ag: null },
    };
  }
  if (next.stage === "final" && next.final?.hg != null && next.third?.hg != null) next = { ...next, stage: "done" };
  return next;
}

export function simRest(t: TournamentSave, score: (home: string, away: string) => [number, number]): TournamentSave {
  let cur = t;
  const open = [
    ...cur.fixtures.filter((f) => f.hg == null && f.home !== cur.userId && f.away !== cur.userId),
    ...cur.semis.filter((f) => f.hg == null && f.home !== cur.userId && f.away !== cur.userId),
  ];
  for (const f of open) {
    const [hg, ag] = score(f.home, f.away);
    cur = recordTie(cur, f.id, hg, ag);
  }
  if (cur.third && cur.third.hg == null && cur.third.home !== cur.userId && cur.third.away !== cur.userId) {
    const [hg, ag] = score(cur.third.home, cur.third.away);
    cur = recordTie(cur, cur.third.id, hg, ag);
  }
  if (cur.final && cur.final.hg == null && cur.final.home !== cur.userId && cur.final.away !== cur.userId) {
    const [hg, ag] = score(cur.final.home, cur.final.away);
    cur = recordTie(cur, cur.final.id, hg, ag);
  }
  return cur;
}
