import { FORMATIONS, fitScore } from "@/game/formations";
import { getClub, getNation, nationSquad, squadOf } from "@/game/data";
import type { FormationId, Player, Pos, Tactics } from "@/game/types";
import { defaultTactics } from "@/game/types";

export type Side = {
  id: string;
  name: string;
  short: string;
  kit: [string, string, string];
  stadium: string;
  xi: Player[];
  bench: Player[];
  tactics: Tactics;
  ovr: number;
};

export function pickXI(players: Player[], formation: FormationId): { xi: Player[]; bench: Player[] } {
  const slots = FORMATIONS[formation];
  const pool = players.map((p) => ({ ...p, visual: { ...p.visual }, tendencies: [...p.tendencies] }));
  const xi: Player[] = [];
  for (const slot of slots) {
    let best = 0;
    let score = -999;
    pool.forEach((p, i) => {
      const s = fitScore(p.pos, slot.pos) + p.ovr + (p.pos === slot.pos ? 2 : 0);
      if (s > score) {
        score = s;
        best = i;
      }
    });
    const [picked] = pool.splice(best, 1);
    if (picked) xi.push(picked);
  }
  const bench = pool.sort((a, b) => b.ovr - a.ovr).slice(0, 8);
  return { xi, bench };
}

function withTakers(side: Omit<Side, "ovr" | "tactics"> & { tactics: Tactics }): Side {
  const outfield = side.xi.filter((p) => p.pos !== "GK");
  const pen = [...outfield].sort((a, b) => b.sho - a.sho)[0];
  const cap = [...outfield].sort((a, b) => b.ovr - a.ovr)[0];
  side.tactics.penalty = side.tactics.penalty || pen?.id || side.xi[0]?.id || "";
  side.tactics.captain = side.tactics.captain || cap?.id || "";
  const ovr = Math.round(side.xi.reduce((s, p) => s + p.ovr, 0) / Math.max(1, side.xi.length));
  return { ...side, ovr };
}

export function makeClubSide(clubId: string, tactics?: Partial<Tactics>, squad?: Player[]): Side {
  const club = getClub(clubId);
  if (!club) throw new Error(`Unknown club ${clubId}`);
  const t = { ...defaultTactics("4-3-3"), ...tactics };
  const picked = pickXI(squad ?? squadOf(clubId), t.formation);
  return withTakers({
    id: club.id,
    name: club.name,
    short: club.short,
    kit: club.kit,
    stadium: club.stadium,
    xi: picked.xi,
    bench: picked.bench,
    tactics: t,
  });
}

export function makeNationSide(natId: string, tactics?: Partial<Tactics>): Side {
  const nation = getNation(natId);
  if (!nation) throw new Error(`Unknown nation ${natId}`);
  const t = { ...defaultTactics("4-3-3"), ...tactics };
  const picked = pickXI(nationSquad(natId), t.formation);
  return withTakers({
    id: nation.id,
    name: nation.name,
    short: nation.id,
    kit: nation.kit,
    stadium: "National Stadium",
    xi: picked.xi,
    bench: picked.bench,
    tactics: t,
  });
}

export function xiOvr(xi: Player[]): number {
  if (!xi.length) return 60;
  return Math.round(xi.reduce((s, p) => s + p.ovr, 0) / xi.length);
}

export function ensurePlayerStarts(side: Side, playerId: string, pos: Pos): Side {
  const all = [...side.xi, ...side.bench];
  const me = all.find((p) => p.id === playerId);
  if (!me) return side;
  if (side.xi.some((p) => p.id === playerId)) return side;
  let replace = 0;
  let worst = 999;
  side.xi.forEach((p, i) => {
    if (p.pos === "GK") return;
    const score = (p.pos === pos ? 0 : 15) + p.ovr * 0.01;
    if (p.ovr < worst) {
      worst = p.ovr;
      replace = i;
    }
    void score;
  });
  const xi = [...side.xi];
  const dropped = xi[replace];
  if (!dropped) return side;
  xi[replace] = me;
  const bench = side.bench.filter((p) => p.id !== playerId);
  bench.push(dropped);
  return { ...side, xi, bench, ovr: xiOvr(xi) };
}
