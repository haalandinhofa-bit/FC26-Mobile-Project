import { clubsIn, getClub, playerValue, squadOf } from "@/game/data";
import { makeClubSide, xiOvr } from "@/game/lineup";
import type { Side } from "@/game/lineup";
import { roundRobin, type CareerSave, type Fixture } from "@/game/save";
import type { Player, Pos, Tactics } from "@/game/types";
import { defaultTactics } from "@/game/types";

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

function clonePlayers(list: Player[]): Player[] {
  return list.map((p) => ({ ...p, visual: { ...p.visual }, tendencies: [...p.tendencies] }));
}

export function leagueClubs(clubId: string) {
  const club = getClub(clubId);
  if (!club) return [];
  const all = clubsIn(club.league);
  const top = all.slice(0, 10);
  if (!top.some((c) => c.id === clubId)) top[top.length - 1] = club;
  return top;
}

function cupDraw(ids: string[], user: string): Fixture[] {
  const rest = ids.filter((id) => id !== user).sort(() => Math.random() - 0.5);
  const teams = [user, ...rest].slice(0, 8);
  while (teams.length < 8) teams.push(ids[teams.length % ids.length]!);
  const fixtures: Fixture[] = [];
  for (let i = 0; i < 8; i += 2) {
    fixtures.push({
      id: `cup-0-${teams[i]}-${teams[i + 1]}`,
      round: 0,
      comp: "cup",
      home: teams[i]!,
      away: teams[i + 1]!,
      hg: null,
      ag: null,
    });
  }
  return fixtures;
}

export function createManager(clubId: string, name: string): CareerSave {
  const club = getClub(clubId);
  if (!club) throw new Error("club");
  const clubs = leagueClubs(clubId);
  const ids = clubs.map((c) => c.id);
  const others: Record<string, Player[]> = {};
  for (const c of clubs) if (c.id !== clubId) others[c.id] = clonePlayers(squadOf(c.id));
  const fixtures = roundRobin(ids, "league");
  return {
    id: rid(),
    kind: "manager",
    name: name || "Manager",
    clubId,
    leagueId: club.league,
    season: 1,
    created: Date.now(),
    budget: Math.round((club.rep - 66) * 4_500_000 + 12_000_000),
    confidence: 72,
    reputation: club.rep,
    tactics: defaultTactics("4-3-3"),
    squad: clonePlayers(squadOf(clubId)),
    others,
    fixtures,
    tableIds: ids,
    cup: { teams: ids.slice(0, 8), round: 0, alive: true, bracket: cupDraw(ids, clubId) },
    messages: [`The board expects a competitive season at ${club.name}. Transfer budget is ready.`],
    trophies: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    trains: 0,
    personal: { goals: 0, assists: 0, ratings: [], apps: 0 },
  };
}

export function createPlayerCareer(opts: {
  name: string;
  nat: string;
  pos: Pos;
  foot: "L" | "R";
  age: number;
  clubId: string;
  skin: number;
  hair: number;
  hairStyle: number;
  height: number;
}): CareerSave {
  const save = createManager(opts.clubId, opts.name);
  save.kind = "player";
  const ovr = opts.age < 20 ? 66 : 70;
  const me: Player = {
    id: `you-${save.id}`,
    name: opts.name || "Jordan Hale",
    nat: opts.nat,
    pos: opts.pos,
    num: 19,
    age: opts.age,
    height: opts.height,
    foot: opts.foot,
    ovr,
    pot: Math.min(92, ovr + (opts.age < 23 ? 12 : 6)),
    pac: ovr + (opts.pos === "LW" || opts.pos === "RW" || opts.pos === "ST" ? 4 : -2),
    sho: ovr + (opts.pos === "ST" ? 6 : -4),
    pas: ovr + (opts.pos === "CAM" || opts.pos === "CM" ? 4 : -2),
    dri: ovr + 1,
    def: opts.pos === "CB" || opts.pos === "CDM" ? ovr + 4 : ovr - 18,
    phy: ovr,
    visual: { skin: opts.skin, hair: opts.hair, hairStyle: opts.hairStyle, bulk: 1 },
    tendencies: ["Your career"],
    clubId: opts.clubId,
  };
  save.squad = [...save.squad.filter((p) => p.ovr < 78 || p.pos === "GK").slice(0, 20), me];
  save.playerId = me.id;
  save.messages.unshift(`${me.name} signs a first professional deal. Earn a place in the side.`);
  return save;
}

export function userSide(save: CareerSave): Side {
  const side = makeClubSide(save.clubId, save.tactics, save.squad);
  return side;
}

export function opponentSide(save: CareerSave, clubId: string): Side {
  const squad = save.others[clubId] ?? squadOf(clubId);
  return makeClubSide(clubId, undefined, squad);
}

export function nextUserFixture(save: CareerSave): Fixture | null {
  const league = save.fixtures.find((f) => f.hg == null && (f.home === save.clubId || f.away === save.clubId));
  if (save.cup.alive) {
    const cup = save.cup.bracket.find((f) => f.hg == null && (f.home === save.clubId || f.away === save.clubId));
    if (cup && (!league || cup.round <= Math.floor((league.round ?? 0) / 3))) return cup;
  }
  return league ?? null;
}

export function squadOvr(save: CareerSave) {
  return xiOvr(makeClubSide(save.clubId, save.tactics, save.squad).xi);
}

function strength(save: CareerSave, clubId: string) {
  if (clubId === save.clubId) return squadOvr(save);
  const squad = save.others[clubId];
  if (!squad) return getClub(clubId)?.rep ?? 70;
  return Math.round([...squad].sort((a, b) => b.ovr - a.ovr).slice(0, 11).reduce((s, p) => s + p.ovr, 0) / 11);
}

function poisson(lambda: number) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 8);
  return k - 1;
}

export function simFixtureScore(save: CareerSave, f: Fixture): [number, number] {
  const h = strength(save, f.home);
  const a = strength(save, f.away);
  return [poisson(1.25 * (h / Math.max(60, a))), poisson(1.02 * (a / Math.max(60, h)))];
}

export function applyScore(save: CareerSave, fixtureId: string, hg: number, ag: number, pens?: [number, number]): CareerSave {
  const next: CareerSave = {
    ...save,
    fixtures: save.fixtures.map((f) => ({ ...f })),
    cup: { ...save.cup, bracket: save.cup.bracket.map((f) => ({ ...f })) },
    stats: { ...save.stats },
    messages: [...save.messages],
    personal: { ...save.personal, ratings: [...save.personal.ratings] },
    squad: save.squad.map((p) => ({ ...p, visual: { ...p.visual }, tendencies: [...p.tendencies] })),
    others: Object.fromEntries(Object.entries(save.others).map(([k, v]) => [k, v.map((p) => ({ ...p, visual: { ...p.visual }, tendencies: [...p.tendencies] }))])),
  };
  const all = [...next.fixtures, ...next.cup.bracket];
  const f = all.find((x) => x.id === fixtureId);
  if (!f || f.hg != null) return save;
  f.hg = hg;
  f.ag = ag;
  if (pens) f.pens = pens;
  const user = f.home === save.clubId || f.away === save.clubId;
  if (user) {
    const gf = f.home === save.clubId ? hg : ag;
    const ga = f.home === save.clubId ? ag : hg;
    next.stats.played++;
    next.stats.gf += gf;
    next.stats.ga += ga;
    if (gf > ga) {
      next.stats.won++;
      next.confidence = Math.min(100, next.confidence + 6);
      next.budget += 750_000;
    } else if (gf === ga) {
      next.stats.drawn++;
      next.confidence = Math.min(100, next.confidence + 1);
      next.budget += 300_000;
    } else {
      next.stats.lost++;
      next.confidence = Math.max(0, next.confidence - 6);
      next.budget += 120_000;
    }
    const opp = f.home === save.clubId ? f.away : f.home;
    const oppName = getClub(opp)?.short ?? opp;
    next.messages.unshift(`${gf > ga ? "Win" : gf === ga ? "Draw" : "Defeat"} against ${oppName}, ${gf}-${ga}.`);
    if (f.comp === "cup" && gf < ga) {
      next.cup.alive = false;
      next.messages.unshift("Knocked out of the cup.");
    }
    if (f.comp === "cup" && gf > ga) maybeAdvanceCup(next);
  } else if (f.comp === "cup") {
    maybeAdvanceCup(next);
  }
  if (leagueComplete(next)) {
    const champ = champion(next);
    if (champ === next.clubId) {
      next.trophies.push(`League season ${next.season}`);
      next.messages.unshift("Champions. The league title stays in the cabinet.");
      next.confidence = Math.min(100, next.confidence + 10);
    } else {
      next.messages.unshift(`${getClub(champ)?.name ?? "A rival"} wins the league.`);
    }
    if (next.cup.alive === false) {
      /* already out */
    }
  }
  return next;
}

function maybeAdvanceCup(save: CareerSave) {
  const round = save.cup.bracket.reduce((m, f) => Math.max(m, f.round), 0);
  const pending = save.cup.bracket.filter((f) => f.round === round && f.hg == null);
  if (pending.length) return;
  const played = save.cup.bracket.filter((f) => f.round === round && f.hg != null);
  if (played.length < 1) return;
  if (round >= 2) {
    const final = played[0];
    if (final && (final.home === save.clubId || final.away === save.clubId)) {
      const won = (final.home === save.clubId && (final.hg ?? 0) > (final.ag ?? 0)) || (final.away === save.clubId && (final.ag ?? 0) > (final.hg ?? 0));
      if (won) {
        save.trophies.push(`Cup season ${save.season}`);
        save.messages.unshift("Cup winners.");
      }
    }
    return;
  }
  const winners = played.map((f) => ((f.hg ?? 0) >= (f.ag ?? 0) ? f.home : f.away));
  for (let i = 0; i < winners.length; i += 2) {
    if (!winners[i + 1]) continue;
    save.cup.bracket.push({
      id: `cup-${round + 1}-${winners[i]}-${winners[i + 1]}`,
      round: round + 1,
      comp: "cup",
      home: winners[i]!,
      away: winners[i + 1]!,
      hg: null,
      ag: null,
    });
  }
}

export function simOtherFixtures(save: CareerSave): CareerSave {
  let cur = save;
  const userFix = nextUserFixture(cur);
  const round = userFix?.round ?? 0;
  const comp = userFix?.comp ?? "league";
  const list = comp === "cup" ? cur.cup.bracket : cur.fixtures;
  for (const f of list) {
    if (f.hg != null) continue;
    if (f.comp !== comp || f.round !== round) continue;
    if (f.home === cur.clubId || f.away === cur.clubId) continue;
    const [hg, ag] = simFixtureScore(cur, f);
    cur = applyScore(cur, f.id, hg, ag);
  }
  return cur;
}

export function simUserFixture(save: CareerSave): CareerSave {
  const f = nextUserFixture(save);
  if (!f) return save;
  let cur = simOtherFixtures(save);
  const [hg, ag] = simFixtureScore(cur, f);
  cur = applyScore(cur, f.id, hg, ag);
  return cur;
}

export function leagueComplete(save: CareerSave) {
  return save.fixtures.every((f) => f.hg != null);
}

export function champion(save: CareerSave) {
  const rows = new Map<string, number>();
  for (const id of save.tableIds) rows.set(id, 0);
  for (const f of save.fixtures) {
    if (f.hg == null || f.ag == null) continue;
    if (f.hg > f.ag) rows.set(f.home, (rows.get(f.home) ?? 0) + 3);
    else if (f.ag > f.hg) rows.set(f.away, (rows.get(f.away) ?? 0) + 3);
    else {
      rows.set(f.home, (rows.get(f.home) ?? 0) + 1);
      rows.set(f.away, (rows.get(f.away) ?? 0) + 1);
    }
  }
  return [...rows.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? save.clubId;
}

export function newSeason(save: CareerSave): CareerSave {
  const clubs = leagueClubs(save.clubId);
  const ids = clubs.map((c) => c.id);
  const aged = (list: Player[]) =>
    list.map((p) => {
      const age = p.age + 1;
      let ovr = p.ovr;
      if (age < 24 && p.pot > ovr && Math.random() < 0.7) ovr = Math.min(p.pot, ovr + 1);
      if (age > 32 && Math.random() < 0.55) ovr = Math.max(62, ovr - 1);
      return { ...p, age, ovr };
    });
  return {
    ...save,
    season: save.season + 1,
    squad: aged(save.squad),
    others: Object.fromEntries(Object.entries(save.others).map(([k, v]) => [k, aged(v)])),
    fixtures: roundRobin(ids, "league"),
    tableIds: ids,
    cup: { teams: ids.slice(0, 8), round: 0, alive: true, bracket: cupDraw(ids, save.clubId) },
    trains: 0,
    messages: [`Season ${save.season + 1} begins.`, ...save.messages].slice(0, 12),
  };
}

export function marketList(save: CareerSave): Player[] {
  const out: Player[] = [];
  for (const [clubId, squad] of Object.entries(save.others)) {
    for (const p of squad) if (p.ovr >= 74 || p.pot >= 82) out.push({ ...p, clubId });
  }
  return out.sort((a, b) => b.ovr - a.ovr).slice(0, 48);
}

export function offerFor(p: Player, kind: "low" | "fair" | "high") {
  const v = playerValue(p);
  return Math.round(v * (kind === "low" ? 0.86 : kind === "high" ? 1.15 : 1));
}

export function tryBuy(save: CareerSave, playerId: string, offer: number): { save: CareerSave; ok: boolean; msg: string } {
  if (save.squad.length >= 26) return { save, ok: false, msg: "Squad is full. Sell someone first." };
  let found: Player | undefined;
  let from = "";
  for (const [club, squad] of Object.entries(save.others)) {
    const p = squad.find((x) => x.id === playerId);
    if (p) {
      found = p;
      from = club;
    }
  }
  if (!found) return { save, ok: false, msg: "That player is no longer listed." };
  const ask = playerValue(found) * (0.9 + Math.random() * 0.18);
  if (offer < ask) return { save, ok: false, msg: `${found.name}'s club rejected ${format(offer)}. They want closer to ${format(ask)}.` };
  if (offer > save.budget) return { save, ok: false, msg: "The offer is above the transfer budget." };
  const others = { ...save.others, [from]: save.others[from]!.filter((p) => p.id !== playerId) };
  const next = {
    ...save,
    budget: save.budget - offer,
    squad: [...save.squad, { ...found, clubId: save.clubId }],
    others,
    messages: [`Signed ${found.name} for ${format(offer)}.`, ...save.messages].slice(0, 12),
  };
  return { save: next, ok: true, msg: `${found.name} joins the squad.` };
}

export function sellPlayer(save: CareerSave, playerId: string): { save: CareerSave; ok: boolean; msg: string } {
  if (save.playerId === playerId) return { save, ok: false, msg: "You can't sell the career player." };
  if (save.squad.length <= 16) return { save, ok: false, msg: "The squad can't go below 16 players." };
  const p = save.squad.find((x) => x.id === playerId);
  if (!p) return { save, ok: false, msg: "Player not in the squad." };
  const fee = Math.round(playerValue(p) * 0.9);
  const buyer = Object.keys(save.others)[0];
  const others = { ...save.others };
  if (buyer) others[buyer] = [...others[buyer]!, { ...p, clubId: buyer }];
  return {
    save: {
      ...save,
      budget: save.budget + fee,
      squad: save.squad.filter((x) => x.id !== playerId),
      others,
      messages: [`Sold ${p.name} for ${format(fee)}.`, ...save.messages].slice(0, 12),
    },
    ok: true,
    msg: `${p.name} sold for ${format(fee)}.`,
  };
}

export function train(save: CareerSave, key: "pac" | "sho" | "pas" | "dri" | "def" | "phy"): CareerSave {
  if (!save.playerId || save.trains >= 4) return save;
  return {
    ...save,
    trains: save.trains + 1,
    squad: save.squad.map((p) => {
      if (p.id !== save.playerId) return p;
      const next = { ...p, [key]: Math.min(95, p[key] + 1) };
      const avg = Math.round((next.pac + next.sho + next.pas + next.dri + next.def + next.phy) / 6);
      next.ovr = Math.min(next.pot + 1, Math.max(next.ovr, avg - 4));
      return next;
    }),
    messages: [`Training complete. +1 ${key.toUpperCase()}.`, ...save.messages].slice(0, 12),
  };
}

export function applyPersonal(save: CareerSave, goals: number, assists: number, rating: number): CareerSave {
  if (!save.playerId) return save;
  return {
    ...save,
    personal: {
      goals: save.personal.goals + goals,
      assists: save.personal.assists + assists,
      apps: save.personal.apps + 1,
      ratings: [...save.personal.ratings, rating].slice(-40),
    },
  };
}

function format(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}m`;
  return `€${Math.round(n / 1000)}k`;
}

export function setTactics(save: CareerSave, tactics: Tactics): CareerSave {
  return { ...save, tactics };
}
